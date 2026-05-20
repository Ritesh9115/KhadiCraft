<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = ['name', 'email', 'phone', 'password', 'role', 'avatar', 'is_active', 'email_verified', 'otp', 'otp_expires_at'];

    protected $hidden = ['password', 'remember_token', 'otp'];

    protected $casts = [
        'email_verified' => 'boolean',
        'is_active' => 'boolean',
        'otp_expires_at' => 'datetime',
    ];

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function measurements()
    {
        return $this->hasMany(MeasurementProfile::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function customOrders()
    {
        return $this->hasMany(CustomOrder::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function wholesaleBuyer()
    {
        return $this->hasOne(WholesaleBuyer::class);
    }

    public function assignedOrders()
    {
        return $this->hasMany(CustomOrder::class, 'assigned_tailor_id');
    }

    public function isAdmin()
    {
        return in_array($this->role, ['admin', 'staff']);
    }

    public function isTailor()
    {
        return $this->role === 'tailor';
    }

    public function isCustomer()
    {
        return $this->role === 'customer';
    }
}
