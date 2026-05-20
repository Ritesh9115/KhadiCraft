<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'fabric_type_id', 'name', 'slug', 'sku', 'short_description', 'description',
        'price', 'sale_price', 'cost_price', 'stock', 'low_stock_alert', 'weight', 'unit', 'product_type',
        'is_active', 'is_featured', 'is_custom_available', 'is_wholesale_available', 'wholesale_min_qty',
        'wholesale_price', 'thumbnail', 'tags', 'views', 'meta_title', 'meta_description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_custom_available' => 'boolean',
        'is_wholesale_available' => 'boolean',
        'tags' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function fabricType()
    {
        return $this->belongsTo(FabricType::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function getEffectivePriceAttribute()
    {
        return $this->sale_price ?? $this->price;
    }

    public function getIsLowStockAttribute()
    {
        return $this->stock > 0 && $this->stock <= $this->low_stock_alert;
    }

    public function getIsOutOfStockAttribute()
    {
        return $this->stock <= 0;
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->where('is_approved', true)->avg('rating');
    }
}
