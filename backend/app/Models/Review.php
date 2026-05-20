<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'user_id', 'product_id', 'order_id', 'rating', 'title', 'review', 'images',
        'is_approved', 'is_featured', 'admin_reply',
    ];

    protected $casts = [
        'images' => 'array',
        'is_approved' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
