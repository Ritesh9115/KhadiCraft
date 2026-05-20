<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FabricType extends Model
{
    protected $fillable = ['name', 'description', 'care_instructions', 'season', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];
}
