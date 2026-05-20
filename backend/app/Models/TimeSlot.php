<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimeSlot extends Model
{
    protected $fillable = ['slot_label', 'start_time', 'end_time', 'max_bookings', 'is_active', 'days_available'];

    protected $casts = [
        'days_available' => 'array',
        'is_active' => 'boolean',
    ];
}
