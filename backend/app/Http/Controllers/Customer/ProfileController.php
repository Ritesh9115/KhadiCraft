<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\{User, Notification};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show()
    {
        $user = auth()->user();
        $user->load(['addresses' => fn($q) => $q->orderBy('is_default', 'desc')]);
        
        return response()->json(['success' => true, 'data' => $user]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|string|max:15|unique:users,phone,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'email', 'phone']);
        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $user
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048'
        ]);

        $user = auth()->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar uploaded successfully.',
            'data' => [
                'avatar' => $path,
                'avatar_url' => asset('storage/' . $path)
            ]
        ]);
    }

    public function addresses()
    {
        $addresses = auth()->user()->addresses()->orderBy('is_default', 'desc')->get();
        return response()->json(['success' => true, 'data' => $addresses]);
    }

    public function addAddress(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:15',
            'address_line1' => 'required|string|max:500',
            'address_line2' => 'nullable|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'pincode' => 'required|string|max:10',
            'is_default' => 'nullable|boolean',
        ]);

        $user = auth()->user();

        // If setting as default, unset other default addresses
        if ($request->boolean('is_default')) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Address added successfully.',
            'data' => $address
        ], 201);
    }

    public function updateAddress(Request $request, $id)
    {
        $request->validate([
            'label' => 'sometimes|string|max:50',
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:15',
            'address_line1' => 'sometimes|string|max:500',
            'address_line2' => 'nullable|string|max:500',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'pincode' => 'sometimes|string|max:10',
            'is_default' => 'nullable|boolean',
        ]);

        $user = auth()->user();
        $address = $user->addresses()->findOrFail($id);

        // If setting as default, unset other default addresses
        if ($request->boolean('is_default')) {
            $user->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Address updated successfully.',
            'data' => $address
        ]);
    }

    public function deleteAddress($id)
    {
        $user = auth()->user();
        $address = $user->addresses()->findOrFail($id);

        // Check if address is being used in any active orders
        $activeOrders = \App\Models\Order::where('user_id', $user->id)
                                       ->where('shipping_address_id', $id)
                                       ->whereIn('status', ['pending', 'confirmed', 'processing'])
                                       ->count();

        if ($activeOrders > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete address that is being used in active orders.'
            ], 422);
        }

        $address->delete();

        return response()->json(['success' => true, 'message' => 'Address deleted successfully.']);
    }

    public function setDefaultAddress($id)
    {
        $user = auth()->user();
        $address = $user->addresses()->findOrFail($id);

        // Unset all other default addresses
        $user->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        
        // Set this as default
        $address->update(['is_default' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Default address updated successfully.',
            'data' => $address
        ]);
    }

    public function notifications()
    {
        $notifications = auth()->user()->notifications()
                                    ->latest()
                                    ->paginate(20);

        return response()->json(['success' => true, 'data' => $notifications]);
    }

    public function markRead($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json(['success' => true, 'message' => 'Notification marked as read.']);
    }

    public function markAllRead()
    {
        auth()->user()->notifications()->where('is_read', false)->update(['is_read' => true]);

        return response()->json(['success' => true, 'message' => 'All notifications marked as read.']);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.'
            ], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Revoke all tokens except current one
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return response()->json(['success' => true, 'message' => 'Password changed successfully.']);
    }

    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => 'required',
            'confirmation' => 'required|string|in:DELETE MY ACCOUNT'
        ]);

        $user = auth()->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password is incorrect.'
            ], 422);
        }

        // Check for active orders
        $activeOrders = \App\Models\Order::where('user_id', $user->id)
                                       ->whereIn('status', ['pending', 'confirmed', 'processing'])
                                       ->count();

        if ($activeOrders > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete account with active orders. Please complete or cancel your orders first.'
            ], 422);
        }

        // Delete avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Delete user
        $user->delete();

        return response()->json(['success' => true, 'message' => 'Account deleted successfully.']);
    }

    public function preferences(Request $request)
    {
        $request->validate([
            'email_notifications' => 'nullable|boolean',
            'sms_notifications' => 'nullable|boolean',
            'marketing_emails' => 'nullable|boolean',
            'language' => 'nullable|string|in:en,hi,pn',
        ]);

        $user = auth()->user();
        $preferences = $request->only(['email_notifications', 'sms_notifications', 'marketing_emails', 'language']);
        
        // Store preferences in user meta or separate preferences table
        $user->update(['preferences' => json_encode($preferences)]);

        return response()->json([
            'success' => true,
            'message' => 'Preferences updated successfully.',
            'data' => $preferences
        ]);
    }
}
