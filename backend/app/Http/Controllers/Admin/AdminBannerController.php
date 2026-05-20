<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AdminBannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('sort_order')->orderBy('created_at')->get();
        return response()->json(['success' => true, 'data' => $banners]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'required|image|max:4096',
            'link' => 'nullable|url',
            'button_text' => 'nullable|string|max:50',
            'position' => 'required|in:home,shop,category,product',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $banner = Banner::create([
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'link' => $request->link,
            'button_text' => $request->button_text,
            'position' => $request->position,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->boolean('is_active', true),
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $banner->update(['image' => $path]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Banner created successfully.',
            'data' => $banner
        ], 201);
    }

    public function show($id)
    {
        $banner = Banner::findOrFail($id);
        return response()->json(['success' => true, 'data' => $banner]);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:4096',
            'link' => 'nullable|url',
            'button_text' => 'nullable|string|max:50',
            'position' => 'sometimes|in:home,shop,category,product',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'subtitle', 'link', 'button_text', 'position', 'sort_order', 'is_active', 'start_date', 'end_date']);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($banner->image) {
                Storage::disk('public')->delete($banner->image);
            }
            $data['image'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Banner updated successfully.',
            'data' => $banner
        ]);
    }

    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);

        // Delete image
        if ($banner->image) {
            Storage::disk('public')->delete($banner->image);
        }

        $banner->delete();

        return response()->json(['success' => true, 'message' => 'Banner deleted successfully.']);
    }

    public function toggle($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->update(['is_active' => !$banner->is_active]);
        
        $status = $banner->is_active ? 'activated' : 'deactivated';
        return response()->json([
            'success' => true,
            'message' => "Banner {$status}.",
            'is_active' => $banner->is_active
        ]);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'banners' => 'required|array',
            'banners.*.id' => 'required|exists:banners,id',
            'banners.*.sort_order' => 'required|integer|min:0'
        ]);

        foreach ($request->banners as $banner) {
            Banner::where('id', $banner['id'])->update(['sort_order' => $banner['sort_order']]);
        }

        return response()->json(['success' => true, 'message' => 'Banners reordered successfully.']);
    }

    public function publicBanners()
    {
        $banners = Banner::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_date')
                      ->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', now());
            })
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get()
            ->groupBy('position');

        return response()->json(['success' => true, 'data' => $banners]);
    }

    public function duplicate($id)
    {
        $originalBanner = Banner::findOrFail($id);
        
        $newBanner = $originalBanner->replicate();
        $newBanner->title = $originalBanner->title . ' (Copy)';
        $newBanner->sort_order = Banner::max('sort_order') + 1;
        $newBanner->is_active = false; // Set new banner as inactive by default
        $newBanner->save();

        // Duplicate image if it exists
        if ($originalBanner->image) {
            $oldPath = $originalBanner->image;
            $newPath = 'banners/copy_' . basename($oldPath);
            
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->copy($oldPath, $newPath);
                $newBanner->update(['image' => $newPath]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Banner duplicated successfully.',
            'data' => $newBanner
        ]);
    }

    public function stats()
    {
        $stats = [
            'total_banners' => Banner::count(),
            'active_banners' => Banner::where('is_active', true)->count(),
            'inactive_banners' => Banner::where('is_active', false)->count(),
            'expired_banners' => Banner::where('end_date', '<', now())->count(),
            'scheduled_banners' => Banner::where('start_date', '>', now())->count(),
        ];

        // Banners by position
        $byPosition = Banner::selectRaw('position, COUNT(*) as count')
                           ->groupBy('position')
                           ->pluck('count', 'position')
                           ->toArray();

        $stats['by_position'] = $byPosition;

        return response()->json(['success' => true, 'data' => $stats]);
    }
}
