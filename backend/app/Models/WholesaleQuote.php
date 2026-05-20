<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WholesaleQuote extends Model
{
    protected $fillable = [
        'buyer_id', 'user_id', 'quote_number', 'status',
        'total', 'total_amount', 'items',
        'delivery_location', 'delivery_date', 'valid_until', 'notes',
    ];

    protected $casts = [
        'items'        => 'array',
        'delivery_date'=> 'date',
        'valid_until'  => 'datetime',
    ];

    public function buyer()
    {
        return $this->belongsTo(WholesaleBuyer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
