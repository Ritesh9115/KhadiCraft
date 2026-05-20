<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\InventoryLog;
use App\Models\Category;
use App\Models\FabricType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminProductController extends Controller
{
    // ─── LIST ALL PRODUCTS ─────────────────────────────────
    public function index(Request $request)
    {
        $query = Product::with(['category', 'fabricType', 'images', 'variants'])
            ->withTrashed($request->boolean('with_deleted'));

        // Filters
        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                  ->orWhere('sku', 'like', "%$s%");
            });
        }
        if ($request->category_id)  $query->where('category_id', $request->category_id);
        if ($request->fabric_type_id) $query->where('fabric_type_id', $request->fabric_type_id);
        if ($request->status === 'active')   $query->where('is_active', true);
        if ($request->status === 'inactive') $query->where('is_active', false);
        if ($request->stock === 'low')       $query->whereRaw('stock <= low_stock_alert AND stock > 0');
        if ($request->stock === 'out')       $query->where('stock', 0);
        if ($request->featured)              $query->where('is_featured', true);
        if ($request->type)                  $query->where('product_type', $request->type);

        $sortBy  = $request->sort_by  ?? 'created_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        $products = $query->paginate($request->per_page ?? 20);

        // Summary counts for admin
        $summary = [
            'total'     => Product::count(),
            'active'    => Product::where('is_active', true)->count(),
            'inactive'  => Product::where('is_active', false)->count(),
            'low_stock' => Product::whereRaw('stock <= low_stock_alert AND stock > 0')->count(),
            'out_stock' => Product::where('stock', 0)->count(),
        ];

        return response()->json(['success' => true, 'data' => $products, 'summary' => $summary]);
    }

    // ─── CREATE PRODUCT ────────────────────────────────────
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'          => 'required|string|max:255',
            'category_id'   => 'required|exists:categories,id',
            'price'         => 'required|numeric|min:0',
            'product_type'  => 'required|in:simple,variable,fabric_meter,custom',
            'stock'         => 'required|integer|min:0',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $slug = $this->uniqueSlug($request->name);

            $product = Product::create([
                'category_id'            => $request->category_id,
                'fabric_type_id'         => $request->fabric_type_id,
                'name'                   => $request->name,
                'slug'                   => $slug,
                'sku'                    => $request->sku ?? strtoupper(Str::random(8)),
                'short_description'      => $request->short_description,
                'description'            => $request->description,
                'price'                  => $request->price,
                'sale_price'             => $request->sale_price,
                'cost_price'             => $request->cost_price,
                'stock'                  => $request->stock,
                'low_stock_alert'        => $request->low_stock_alert ?? 10,
                'weight'                 => $request->weight,
                'unit'                   => $request->unit ?? 'piece',
                'product_type'           => $request->product_type,
                'is_active'              => $request->boolean('is_active', true),
                'is_featured'            => $request->boolean('is_featured', false),
                'is_custom_available'    => $request->boolean('is_custom_available', false),
                'is_wholesale_available' => $request->boolean('is_wholesale_available', true),
                'wholesale_min_qty'      => $request->wholesale_min_qty ?? 10,
                'wholesale_price'        => $request->wholesale_price,
                'tags'                   => $request->tags ? json_encode($request->tags) : null,
                'meta_title'             => $request->meta_title,
                'meta_description'       => $request->meta_description,
            ]);

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                $path = $request->file('thumbnail')->store('products', 'public');
                $product->update(['thumbnail' => $path]);
            }

            // Log initial stock
            if ($request->stock > 0) {
                InventoryLog::create([
                    'product_id'     => $product->id,
                    'type'           => 'stock_in',
                    'quantity'       => $request->stock,
                    'stock_before'   => 0,
                    'stock_after'    => $request->stock,
                    'reference_type' => 'manual',
                    'notes'          => 'Initial stock entry',
                    'created_by'     => auth()->id(),
                ]);
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Product created successfully.',
                'data'    => $product->load(['category', 'fabricType', 'images', 'variants']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to create product: ' . $e->getMessage()], 500);
        }
    }

    // ─── SHOW PRODUCT ──────────────────────────────────────
    public function show($id)
    {
        $product = Product::with(['category', 'fabricType', 'images', 'variants', 'reviews'])
            ->withTrashed()->findOrFail($id);
        return response()->json(['success' => true, 'data' => $product]);
    }

    // ─── UPDATE PRODUCT ────────────────────────────────────
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'         => 'sometimes|string|max:255',
            'category_id'  => 'sometimes|exists:categories,id',
            'price'        => 'sometimes|numeric|min:0',
            'product_type' => 'sometimes|in:simple,variable,fabric_meter,custom',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->only([
            'category_id','fabric_type_id','name','short_description','description',
            'price','sale_price','cost_price','low_stock_alert','weight','unit',
            'product_type','is_active','is_featured','is_custom_available',
            'is_wholesale_available','wholesale_min_qty','wholesale_price',
            'meta_title','meta_description'
        ]);

        if ($request->name && $request->name !== $product->name) {
            $data['slug'] = $this->uniqueSlug($request->name, $product->id);
        }
        if ($request->has('tags')) {
            $data['tags'] = json_encode($request->tags);
        }
        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail) Storage::disk('public')->delete($product->thumbnail);
            $data['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
        }

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data'    => $product->load(['category', 'fabricType', 'images', 'variants']),
        ]);
    }

    // ─── DELETE PRODUCT ────────────────────────────────────
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete(); // soft delete
        return response()->json(['success' => true, 'message' => 'Product deleted successfully.']);
    }

    // ─── UPLOAD IMAGES ─────────────────────────────────────
    public function uploadImages(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $request->validate(['images' => 'required|array', 'images.*' => 'image|max:4096']);

        $uploaded = [];
        foreach ($request->file('images') as $idx => $file) {
            $path = $file->store('products', 'public');
            $image = ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $path,
                'sort_order' => $idx,
                'is_primary' => $product->images()->count() === 0 && $idx === 0,
            ]);
            $uploaded[] = $image;
        }

        return response()->json(['success' => true, 'message' => 'Images uploaded.', 'data' => $uploaded]);
    }

    // ─── DELETE IMAGE ──────────────────────────────────────
    public function deleteImage($id, $imgId)
    {
        $image = ProductImage::where('product_id', $id)->findOrFail($imgId);
        Storage::disk('public')->delete($image->image_path);
        $image->delete();
        return response()->json(['success' => true, 'message' => 'Image deleted.']);
    }

    // ─── UPDATE STOCK ──────────────────────────────────────
    public function updateStock(Request $request, $id)
    {
        $request->validate([
            'type'     => 'required|in:stock_in,stock_out,adjustment,damage',
            'quantity' => 'required|integer|min:1',
            'notes'    => 'nullable|string',
        ]);

        $product = Product::findOrFail($id);
        $before  = $product->stock;

        if ($request->type === 'stock_out' || $request->type === 'damage') {
            if ($product->stock < $request->quantity) {
                return response()->json(['success' => false, 'message' => 'Insufficient stock.'], 400);
            }
            $after = $product->stock - $request->quantity;
        } elseif ($request->type === 'adjustment') {
            $after = $request->quantity; // set absolute
        } else {
            $after = $product->stock + $request->quantity;
        }

        $product->update(['stock' => $after]);

        InventoryLog::create([
            'product_id'     => $product->id,
            'type'           => $request->type,
            'quantity'       => $request->quantity,
            'stock_before'   => $before,
            'stock_after'    => $after,
            'reference_type' => 'manual',
            'notes'          => $request->notes,
            'created_by'     => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stock updated successfully.',
            'stock'   => $after,
        ]);
    }

    // ─── TOGGLE ACTIVE ─────────────────────────────────────
    public function toggle($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => !$product->is_active]);
        $status = $product->is_active ? 'activated' : 'deactivated';
        return response()->json(['success' => true, 'message' => "Product $status.", 'is_active' => $product->is_active]);
    }

    // ─── TOGGLE FEATURED ───────────────────────────────────
    public function toggleFeatured($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_featured' => !$product->is_featured]);
        return response()->json(['success' => true, 'is_featured' => $product->is_featured]);
    }

    // ─── BULK ACTION ───────────────────────────────────────
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action'  => 'required|in:activate,deactivate,delete,feature,unfeature',
            'ids'     => 'required|array',
            'ids.*'   => 'exists:products,id',
        ]);

        $products = Product::whereIn('id', $request->ids);

        match ($request->action) {
            'activate'   => $products->update(['is_active' => true]),
            'deactivate' => $products->update(['is_active' => false]),
            'delete'     => $products->each(fn($p) => $p->delete()),
            'feature'    => $products->update(['is_featured' => true]),
            'unfeature'  => $products->update(['is_featured' => false]),
        };

        return response()->json(['success' => true, 'message' => 'Bulk action applied successfully.']);
    }

    // ─── ADD VARIANT ───────────────────────────────────────
    public function addVariant(Request $request, $id)
    {
        $request->validate([
            'size'  => 'nullable|string',
            'color' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'price' => 'nullable|numeric',
        ]);

        $product = Product::findOrFail($id);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size'       => $request->size,
            'color'      => $request->color,
            'color_hex'  => $request->color_hex,
            'sku'        => $request->sku ?? $product->sku . '-' . strtoupper(Str::random(4)),
            'price'      => $request->price,
            'stock'      => $request->stock,
        ]);

        return response()->json(['success' => true, 'data' => $variant]);
    }

    // ─── UPDATE VARIANT ────────────────────────────────────
    public function updateVariant(Request $request, $id, $vid)
    {
        $variant = ProductVariant::where('product_id', $id)->findOrFail($vid);
        $variant->update($request->only(['size','color','color_hex','sku','price','stock','is_active']));
        return response()->json(['success' => true, 'data' => $variant]);
    }

    // ─── DELETE VARIANT ────────────────────────────────────
    public function deleteVariant($id, $vid)
    {
        $variant = ProductVariant::where('product_id', $id)->findOrFail($vid);
        $variant->delete();
        return response()->json(['success' => true, 'message' => 'Variant deleted.']);
    }

    // ─── HELPERS ───────────────────────────────────────────
    private function uniqueSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $count = 1;
        while (true) {
            $q = Product::where('slug', $slug);
            if ($excludeId) $q->where('id', '!=', $excludeId);
            if (!$q->exists()) break;
            $slug = Str::slug($name) . '-' . $count++;
        }
        return $slug;
    }
}
