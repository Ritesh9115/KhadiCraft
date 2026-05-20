<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomOrder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'custom_order_number', 'status',
        'style_type', 'fabric_product_id', 'fabric_name', 'fabric_preference',
        // Individual measurements
        'chest', 'waist', 'hips', 'shoulder', 'shirt_length', 'pant_length',
        'sleeve_length', 'neck', 'thigh', 'inseam',
        'measurement_profile_id', 'measurements',
        'special_instructions', 'notes', 'reference_images',
        'estimated_price', 'final_price',
        'assigned_tailor_id', 'estimated_ready_date', 'admin_notes',
    ];

    protected $casts = [
        'estimated_ready_date' => 'date',
        'reference_images'     => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTailor()
    {
        return $this->belongsTo(User::class, 'assigned_tailor_id');
    }

    public function measurementProfile()
    {
        return $this->belongsTo(MeasurementProfile::class);
    }

    public function stages()
    {
        return $this->hasMany(CustomOrderStage::class);
    }
}
