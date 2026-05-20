<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->status === 'active') {
            $query->where('is_active', true);
        } elseif ($request->status === 'inactive') {
            $query->where('is_active', false);
        }

        if ($request->email_verified) {
            $query->where('email_verified', $request->boolean('email_verified'));
        }

        $users = $query->latest()->paginate(20);

        return response()->json(['success' => true, 'data' => $users]);
    }

    public function show($id)
    {
        $user = User::with(['orders', 'customOrders', 'appointments'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $user]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'sometimes|string|max:15|unique:users,phone,' . $id,
            'role' => 'sometimes|in:customer,tailor,admin,staff',
            'is_active' => 'sometimes|boolean',
            'email_verified' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'email', 'phone', 'role', 'is_active', 'email_verified']);

        if ($request->password) {
            $validator = Validator::make($request->all(), [
                'password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }

            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data' => $user
        ]);
    }

    public function toggle($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent admin from deactivating themselves
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account.'
            ], 422);
        }

        $user->update(['is_active' => !$user->is_active]);
        
        $status = $user->is_active ? 'activated' : 'deactivated';
        return response()->json([
            'success' => true,
            'message' => "User {$status}.",
            'is_active' => $user->is_active
        ]);
    }

    public function changeRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:customer,tailor,admin,staff'
        ]);

        $user = User::findOrFail($id);
        
        // Prevent admin from changing their own role
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot change your own role.'
            ], 422);
        }

        $oldRole = $user->role;
        $user->update(['role' => $request->role]);

        return response()->json([
            'success' => true,
            'message' => "User role changed from {$oldRole} to {$request->role}.",
            'role' => $request->role
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.'
            ], 422);
        }

        // Check if user has related data
        if ($user->orders()->exists() || $user->customOrders()->exists() || $user->appointments()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete user with associated orders, appointments, or custom orders.'
            ], 422);
        }

        $user->delete();

        return response()->json(['success' => true, 'message' => 'User deleted successfully.']);
    }

    public function tailors()
    {
        $tailors = User::where('role', 'tailor')
                      ->where('is_active', true)
                      ->orderBy('name')
                      ->get(['id', 'name', 'email', 'phone']);

        return response()->json(['success' => true, 'data' => $tailors]);
    }

    public function staff()
    {
        $staff = User::whereIn('role', ['admin', 'staff'])
                    ->where('is_active', true)
                    ->orderBy('role')
                    ->orderBy('name')
                    ->get(['id', 'name', 'email', 'phone', 'role']);

        return response()->json(['success' => true, 'data' => $staff]);
    }

    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:15|unique:users,phone',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:customer,tailor,admin,staff',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => $request->boolean('is_active', true),
            'email_verified' => $request->boolean('email_verified', false),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data' => $user
        ], 201);
    }
}
