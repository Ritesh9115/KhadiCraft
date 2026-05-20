<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\FabricType;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Product::where('is_active', true);

            if ($request->search) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('name', 'like', "%$s%")
                      ->orWhere('sku', 'like', "%$s%");
                });
            }

            if ($request->category)    $query->where('category', $request->category);
            if ($request->fabric_type) $query->where('fabric_type', $request->fabric_type);
            if ($request->min_price)   $query->where('price', '>=', $request->min_price);
            if ($request->max_price)   $query->where('price', '<=', $request->max_price);
            if ($request->in_stock)    $query->where('stock', '>', 0);
            if ($request->featured == '1' || $request->featured == true) {
                $query->where('is_featured', true);
            }
            
            $sort = match ($request->sort) {
                'price_asc'  => ['price', 'asc'],
                'price_desc' => ['price', 'desc'],
                'popular'    => ['views', 'desc'],
                default      => ['created_at', 'desc'],
            };
            $query->orderBy($sort[0], $sort[1]);

            // Handle limit (for homepage featured)
            if ($request->limit) {
                $products = $query->limit((int)$request->limit)->get();
                return response()->json(['success' => true, 'data' => $products]);
            }

            $perPage  = min((int)($request->per_page ?? 16), 100);
            $products = $query->paginate($perPage);

            return response()->json(['success' => true, 'data' => $products]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($slug)
    {
        try {
            $product = Product::with([
                'category',
                'fabricType',
                'images',
                'variants' => fn($q) => $q->where('is_active', true),
                'reviews'  => fn($q) => $q->where('is_approved', true)->with('user')->latest()->limit(20)
            ])->where('slug', $slug)->where('is_active', true)->firstOrFail();

            $product->increment('views');

            $related = Product::with(['images'])
                ->where('category_id', $product->category_id)
                ->where('id', '!=', $product->id)
                ->where('is_active', true)
                ->limit(4)->get();

            return response()->json([
                'success' => true,
                'data'    => $product,
                'related' => $related
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function categories()
    {
        try {
            $cats = Category::with('children')
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get();
            return response()->json(['success' => true, 'data' => $cats]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function categoryProducts($slug)
    {
        try {
            $cat = Category::where('slug', $slug)->where('is_active', true)->firstOrFail();
            $childIds = $cat->children()->pluck('id')->toArray();
            $allIds   = array_merge([$cat->id], $childIds);

            $products = Product::with(['images', 'variants'])
                ->whereIn('category_id', $allIds)
                ->where('is_active', true)
                ->paginate(16);

            return response()->json(['success' => true, 'category' => $cat, 'data' => $products]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function fabricTypes()
    {
        try {
            $types = FabricType::where('is_active', true)->get();
            return response()->json(['success' => true, 'data' => $types]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
