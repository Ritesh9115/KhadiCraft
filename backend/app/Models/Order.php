<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'order_number', 'shipping_address_id', 'payment_method', 'payment_status',
        'status', 'notes', 'admin_notes', 'subtotal', 'shipping_cost', 'tax', 'total',
        'tracking_number', 'courier', 'estimated_delivery', 'delivered_at', 'payment_id', 'paid_at',
    ];

    protected $casts = [
        'delivered_at' => 'datetime',
        'paid_at'      => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }
}
