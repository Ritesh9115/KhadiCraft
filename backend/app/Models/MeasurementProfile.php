<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeasurementProfile extends Model
{
    protected $fillable = [
        'user_id', 'profile_name', 'chest', 'waist', 'hips', 'shoulder', 'shirt_length',
        'pant_length', 'sleeve_length', 'neck', 'thigh', 'inseam', 'ankle', 'unit', 'notes', 'is_default',
    ];

    protected $casts = ['is_default' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
