<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'purpose', 'type', 'appointment_date', 'time_slot',
        'status', 'notes', 'admin_notes', 'assigned_staff_id',
    ];

    protected $casts = ['appointment_date' => 'date'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedStaff()
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }
}
