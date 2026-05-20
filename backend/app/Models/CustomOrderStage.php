<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomOrderStage extends Model
{
    // DB columns: id, custom_order_id, stage, status, completed_at, notes, created_at, updated_at
    protected $fillable = ['custom_order_id', 'stage', 'status', 'notes', 'completed_at'];

    protected $casts = ['completed_at' => 'datetime'];
}
