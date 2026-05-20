<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WholesaleBuyer extends Model
{
    protected $fillable = [
        'user_id', 'business_name', 'gst_number', 'business_type',
        'contact_name', 'phone', 'email',
        'address', 'city', 'state', 'pincode',
        'expected_monthly_value', 'discount_percentage',
        'products_interested', 'notes', 'status', 'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quotes()
    {
        return $this->hasMany(WholesaleQuote::class, 'buyer_id');
    }
}
