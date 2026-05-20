<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminAppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with(['user']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('appointment_number', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', '%' . $request->search . '%'));
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->date_from) {
            $query->whereDate('appointment_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('appointment_date', '<=', $request->date_to);
        }

        $appointments = $query->latest()->paginate(20);

        return response()->json(['success' => true, 'data' => $appointments]);
    }

    public function show($id)
    {
        $appointment = Appointment::with(['user'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $appointment]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,rescheduled,cancelled,completed,no_show'
        ]);

        $appointment = Appointment::findOrFail($id);
        $oldStatus = $appointment->status;
        $appointment->update(['status' => $request->status]);

        // Create notification for user
        if ($oldStatus !== $request->status) {
            $user = User::find($appointment->user_id);
            if ($user) {
                $message = "Your appointment #{$appointment->appointment_number} status has been updated to: " . ucfirst($request->status);
                
                // You can create a notification model or use a simple approach
                // For now, we'll just return success
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Appointment status updated successfully.',
            'data' => $appointment
        ]);
    }

    public function assignStaff(Request $request, $id)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id'
        ]);

        $appointment = Appointment::findOrFail($id);
        $staff = User::where('id', $request->staff_id)
                     ->whereIn('role', ['admin', 'staff'])
                     ->firstOrFail();

        $appointment->update(['assigned_staff_id' => $staff->id]);

        return response()->json([
            'success' => true,
            'message' => 'Staff assigned successfully.',
            'data' => $appointment->load('assignedStaff')
        ]);
    }

    public function addNote(Request $request, $id)
    {
        $request->validate([
            'notes' => 'required|string|max:1000'
        ]);

        $appointment = Appointment::findOrFail($id);
        $appointment->update(['notes' => $request->notes]);

        return response()->json([
            'success' => true,
            'message' => 'Note added successfully.',
            'data' => $appointment
        ]);
    }

    public function calendar(Request $request)
    {
        $month = $request->month ?? date('Y-m');
        $startDate = Carbon::parse($month . '-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $appointments = Appointment::with(['user'])
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->orderBy('appointment_date')
            ->orderBy('time_slot')
            ->get();

        return response()->json(['success' => true, 'data' => $appointments]);
    }

    public function timeSlots()
    {
        // Actually fetch the slots from the database!
        $slots = \App\Models\TimeSlot::all();
        return response()->json(['success' => true, 'data' => $slots]);
    }

    public function createSlot(Request $request)
    {
        $request->validate([
            'time_range' => 'required|string',
        ]);

        $slot = \App\Models\TimeSlot::create([
            'time_range' => $request->time_range,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Time slot created successfully.',
            'data' => $slot
        ]);
    }

    public function deleteSlot($id)
    {
        $slot = \App\Models\TimeSlot::findOrFail($id);
        $slot->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Time slot deleted successfully.'
        ]);
    }
}
