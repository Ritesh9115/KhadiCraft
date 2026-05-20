<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::where('user_id', auth()->id());

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        $appointments = $query->latest()->paginate(10);

        return response()->json(['success' => true, 'data' => $appointments]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type'             => 'required|in:shop_visit,home_visit,measurement,consultation,fabric_selection',
            'appointment_date' => 'required|date|after_or_equal:today',
            'time_slot'        => 'required|string',
            'purpose'          => 'required|string|max:255',
            'notes'            => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Check slot availability (max 3 per slot)
        $existing = Appointment::where('appointment_date', $request->appointment_date)
                               ->where('time_slot', $request->time_slot)
                               ->where('status', '!=', 'cancelled')
                               ->count();

        if ($existing >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot is not available. Please choose another time.'
            ], 422);
        }

        $appointment = Appointment::create([
            'user_id'          => auth()->id(),
            'type'             => $request->type,
            'appointment_date' => $request->appointment_date,
            'time_slot'        => $request->time_slot,
            'purpose'          => $request->purpose,
            'notes'            => $request->notes,
            'status'           => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment booked successfully.',
            'data'    => $appointment,
        ], 201);
    }

    public function show($id)
    {
        $appointment = Appointment::where('user_id', auth()->id())->findOrFail($id);
        return response()->json(['success' => true, 'data' => $appointment]);
    }

    public function cancel($id)
    {
        $appointment = Appointment::where('user_id', auth()->id())->findOrFail($id);

        if (!in_array($appointment->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment cannot be cancelled at this stage.'
            ], 422);
        }

        // Check if cancellation is within allowed time (e.g., 24 hours before)
        $appointmentDateTime = Carbon::parse($appointment->appointment_date . ' ' . $appointment->time_slot);
        if ($appointmentDateTime->diffInHours(now()) < 24) {
            return response()->json([
                'success' => false,
                'message' => 'Appointments must be cancelled at least 24 hours in advance.'
            ], 422);
        }

        $appointment->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Appointment cancelled successfully.'
        ]);
    }

    public function reschedule(Request $request, $id)
    {
        $appointment = Appointment::where('user_id', auth()->id())->findOrFail($id);

        if (!in_array($appointment->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment cannot be rescheduled at this stage.'
            ], 422);
        }

        $request->validate([
            'appointment_date' => 'required|date|after_or_equal:today',
            'time_slot' => 'required|string',
        ]);

        // Check if new slot is available
        $existingAppointment = Appointment::where('appointment_date', $request->appointment_date)
                                        ->where('time_slot', $request->time_slot)
                                        ->where('status', '!=', 'cancelled')
                                        ->where('id', '!=', $id)
                                        ->count();

        if ($existingAppointment >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot is not available. Please choose another time.'
            ], 422);
        }

        $oldDateTime = $appointment->appointment_date . ' ' . $appointment->time_slot;
        $appointment->update([
            'appointment_date' => $request->appointment_date,
            'time_slot' => $request->time_slot,
            'status' => 'pending', // Reset to pending for rescheduling
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment rescheduled successfully.',
            'data' => $appointment
        ]);
    }

    public function availableSlots(Request $request)
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today'
        ]);

        $date = $request->date;
        $isToday = $date === now()->toDateString();
        $currentTime = now()->format('H:i');

        $timeSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
        ];

        $availableSlots = [];

        foreach ($timeSlots as $slot) {
            // FIXED: If the date is today, and the timeslot has already passed, mark it unavailable
            if ($isToday && $slot <= $currentTime) {
                $availableSlots[] = [
                    'time' => $slot,
                    'available' => false,
                    'booked_count' => 3, // Simulate fully booked
                    'max_bookings' => 3
                ];
                continue;
            }

            $bookedCount = Appointment::where('appointment_date', $date)
                                    ->where('time_slot', $slot)
                                    ->where('status', '!=', 'cancelled')
                                    ->count();

            $availableSlots[] = [
                'time' => $slot,
                'available' => $bookedCount < 3,
                'booked_count' => $bookedCount,
                'max_bookings' => 3
            ];
        }

        return response()->json(['success' => true, 'data' => $availableSlots]);
    }

    public function calendar(Request $request)
    {
        $month = $request->month ?? date('Y-m');
        $startDate = Carbon::parse($month . '-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $appointments = Appointment::where('user_id', auth()->id())
                                  ->whereBetween('appointment_date', [$startDate, $endDate])
                                  ->orderBy('appointment_date')
                                  ->orderBy('time_slot')
                                  ->get();

        return response()->json(['success' => true, 'data' => $appointments]);
    }
}
