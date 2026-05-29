<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomOrderStage extends Model
{
    protected $fillable = ['custom_order_id', 'stage', 'status', 'notes', 'completed_at'];

    protected $casts = ['completed_at' => 'datetime'];
}
