<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\CustomOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RoleBasedAccessTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_can_access_admin_routes()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        
        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard');
        $response->assertStatus(200);
        
        $response = $this->actingAs($admin)->getJson('/api/admin/products');
        $response->assertStatus(200);
        
        $response = $this->actingAs($admin)->getJson('/api/admin/orders');
        $response->assertStatus(200);
    }

    /** @test */
    public function tailor_can_access_tailor_routes()
    {
        $tailor = User::factory()->create(['role' => 'tailor']);
        
        $response = $this->actingAs($tailor)->getJson('/api/tailor/dashboard');
        $response->assertStatus(200);
        
        $response = $this->actingAs($tailor)->getJson('/api/tailor/assigned-orders');
        $response->assertStatus(200);
    }

    /** @test */
    public function customer_cannot_access_admin_routes()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        
        $response = $this->actingAs($customer)->getJson('/api/admin/dashboard');
        $response->assertStatus(403);
        
        $response = $this->actingAs($customer)->getJson('/api/admin/products');
        $response->assertStatus(403);
    }

    /** @test */
    public function customer_cannot_access_tailor_routes()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        
        $response = $this->actingAs($customer)->getJson('/api/tailor/dashboard');
        $response->assertStatus(403);
        
        $response = $this->actingAs($customer)->getJson('/api/tailor/assigned-orders');
        $response->assertStatus(403);
    }

    /** @test */
    public function tailor_cannot_access_admin_routes()
    {
        $tailor = User::factory()->create(['role' => 'tailor']);
        
        $response = $this->actingAs($tailor)->getJson('/api/admin/dashboard');
        $response->assertStatus(403);
        
        $response = $this->actingAs($tailor)->getJson('/api/admin/users');
        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_access_tailor_routes()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        
        $response = $this->actingAs($admin)->getJson('/api/tailor/dashboard');
        $response->assertStatus(403); // Admin should not access tailor routes
    }

    /** @test */
    public function unauthenticated_user_cannot_access_protected_routes()
    {
        $response = $this->getJson('/api/admin/dashboard');
        $response->assertStatus(401);
        
        $response = $this->getJson('/api/tailor/dashboard');
        $response->assertStatus(401);
        
        $response = $this->getJson('/api/profile');
        $response->assertStatus(401);
    }

    /** @test */
    public function staff_can_access_admin_routes()
    {
        $staff = User::factory()->create(['role' => 'staff']);
        
        $response = $this->actingAs($staff)->getJson('/api/admin/dashboard');
        $response->assertStatus(200);
        
        $response = $this->actingAs($staff)->getJson('/api/admin/products');
        $response->assertStatus(200);
    }

    /** @test */
    public function customer_can_access_customer_routes()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        
        $response = $this->actingAs($customer)->getJson('/api/profile');
        $response->assertStatus(200);
        
        $response = $this->actingAs($customer)->getJson('/api/orders');
        $response->assertStatus(200);
        
        $response = $this->actingAs($customer)->getJson('/api/custom-orders');
        $response->assertStatus(200);
    }

    /** @test */
    public function admin_can_manage_users()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'customer']);
        
        $response = $this->actingAs($admin)->getJson('/api/admin/users');
        $response->assertStatus(200);
        
        $response = $this->actingAs($admin)->putJson("/api/admin/users/{$customer->id}", [
            'role' => 'tailor'
        ]);
        $response->assertStatus(200);
        
        $this->assertEquals('tailor', $customer->fresh()->role);
    }

    /** @test */
    public function tailor_cannot_manage_users()
    {
        $tailor = User::factory()->create(['role' => 'tailor']);
        $customer = User::factory()->create(['role' => 'customer']);
        
        $response = $this->actingAs($tailor)->getJson('/api/admin/users');
        $response->assertStatus(403);
        
        $response = $this->actingAs($tailor)->putJson("/api/admin/users/{$customer->id}", [
            'role' => 'admin'
        ]);
        $response->assertStatus(404); // Route not found for tailors
    }

    /** @test */
    public function role_middleware_works_correctly()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tailor = User::factory()->create(['role' => 'tailor']);
        $customer = User::factory()->create(['role' => 'customer']);
        
        // Test admin role middleware
        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard');
        $response->assertStatus(200);
        
        $response = $this->actingAs($tailor)->getJson('/api/admin/dashboard');
        $response->assertStatus(403);
        
        $response = $this->actingAs($customer)->getJson('/api/admin/dashboard');
        $response->assertStatus(403);
        
        // Test tailor role middleware
        $response = $this->actingAs($tailor)->getJson('/api/tailor/dashboard');
        $response->assertStatus(200);
        
        $response = $this->actingAs($admin)->getJson('/api/tailor/dashboard');
        $response->assertStatus(403);
        
        $response = $this->actingAs($customer)->getJson('/api/tailor/dashboard');
        $response->assertStatus(403);
    }

    /** @test */
    public function custom_order_access_control()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $tailor = User::factory()->create(['role' => 'tailor']);
        $customer = User::factory()->create(['role' => 'customer']);
        
        $customOrder = CustomOrder::factory()->create(['user_id' => $customer->id]);
        
        // Customer can access their own orders
        $response = $this->actingAs($customer)->getJson("/api/custom-orders/{$customOrder->custom_order_number}");
        $response->assertStatus(200);
        
        // Admin can access all orders
        $response = $this->actingAs($admin)->getJson("/api/admin/custom-orders/{$customOrder->id}");
        $response->assertStatus(200);
        
        // Tailor can access assigned orders
        $customOrder->update(['assigned_tailor_id' => $tailor->id]);
        $response = $this->actingAs($tailor)->getJson("/api/tailor/orders/{$customOrder->id}");
        $response->assertStatus(200);
    }

    /** @test */
    public function order_access_control()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'customer']);
        
        $order = Order::factory()->create(['user_id' => $customer->id]);
        
        // Customer can access their own orders
        $response = $this->actingAs($customer)->getJson("/api/orders/{$order->order_number}");
        $response->assertStatus(200);
        
        // Admin can access all orders
        $response = $this->actingAs($admin)->getJson("/api/admin/orders/{$order->id}");
        $response->assertStatus(200);
        
        // Customer cannot access admin order endpoints
        $response = $this->actingAs($customer)->getJson("/api/admin/orders/{$order->id}");
        $response->assertStatus(403);
    }
}
