<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\{Review, Product, Order};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function productReviews($productId)
    {
        $reviews = Review::where('product_id', $productId)
                        ->where('is_approved', true)
                        ->with('user:id,name,avatar')
                        ->latest()
                        ->paginate(10);

        return response()->json(['success' => true, 'data' => $reviews]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'order_id' => 'required|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string|min:10|max:1000',
            'images' => 'nullable|array|max:3',
            'images.*' => 'image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $product = Product::findOrFail($request->product_id);
        $order = Order::where('id', $request->order_id)
                     ->where('user_id', $user->id)
                     ->where('status', 'delivered')
                     ->firstOrFail();

        // Check if user has already reviewed this product
        $existingReview = Review::where('user_id', $user->id)
                               ->where('product_id', $request->product_id)
                               ->where('order_id', $request->order_id)
                               ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this product for this order.'
            ], 422);
        }

        // Check if product was actually in the order
        $orderContainsProduct = $order->items()
                                     ->where('product_id', $request->product_id)
                                     ->exists();

        if (!$orderContainsProduct) {
            return response()->json([
                'success' => false,
                'message' => 'This product was not in your order.'
            ], 422);
        }

        $reviewData = [
            'user_id' => $user->id,
            'product_id' => $request->product_id,
            'order_id' => $request->order_id,
            'rating' => $request->rating,
            'title' => $request->title,
            'comment' => $request->comment,
            'is_approved' => false, // Reviews need admin approval
        ];

        $review = Review::create($reviewData);

        // Handle review images
        if ($request->hasFile('images')) {
            $images = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('reviews', 'public');
                $images[] = [
                    'path' => $path,
                    'original_name' => $image->getClientOriginalName(),
                ];
            }
            $review->update(['images' => json_encode($images)]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully. It will be visible after admin approval.',
            'data' => $review
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $review = Review::where('id', $id)
                       ->where('user_id', auth()->id())
                       ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'sometimes|string|min:10|max:1000',
            'images' => 'nullable|array|max:3',
            'images.*' => 'image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->only(['rating', 'title', 'comment']);

        // Handle review images
        if ($request->hasFile('images')) {
            $existingImages = json_decode($review->images ?? '[]', true) ?? [];
            
            // Delete old images if they exist
            foreach ($existingImages as $oldImage) {
                if (isset($oldImage['path'])) {
                    \Storage::disk('public')->delete($oldImage['path']);
                }
            }

            $images = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('reviews', 'public');
                $images[] = [
                    'path' => $path,
                    'original_name' => $image->getClientOriginalName(),
                ];
            }
            $data['images'] = json_encode($images);
        }

        // Reset approval status if content was changed
        if (isset($data['rating']) || isset($data['title']) || isset($data['comment'])) {
            $data['is_approved'] = false;
        }

        $review->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully.' . (isset($data['is_approved']) && !$data['is_approved'] ? ' It will be visible after admin approval.' : ''),
            'data' => $review
        ]);
    }

    public function destroy($id)
    {
        $review = Review::where('id', $id)
                       ->where('user_id', auth()->id())
                       ->firstOrFail();

        // Delete review images
        if ($review->images) {
            $images = json_decode($review->images, true) ?? [];
            foreach ($images as $image) {
                if (isset($image['path'])) {
                    \Storage::disk('public')->delete($image['path']);
                }
            }
        }

        $review->delete();

        return response()->json(['success' => true, 'message' => 'Review deleted successfully.']);
    }

    public function myReviews()
    {
        $reviews = Review::where('user_id', auth()->id())
                        ->with(['product:id,name,slug,thumbnail', 'order:id,order_number'])
                        ->latest()
                        ->paginate(10);

        return response()->json(['success' => true, 'data' => $reviews]);
    }

    public function eligibleForReview()
    {
        $user = auth()->id();

        // Get delivered orders that haven't been reviewed yet
        $deliveredOrders = Order::where('user_id', $user)
                               ->where('status', 'delivered')
                               ->whereDoesntHave('reviews', fn($q) => $q->where('user_id', $user))
                               ->with(['items.product' => fn($p) => $p->select('id', 'name', 'slug', 'thumbnail')])
                               ->latest()
                               ->get();

        $eligibleProducts = [];

        foreach ($deliveredOrders as $order) {
            foreach ($order->items as $item) {
                // Check if this specific product-order combination has been reviewed
                $alreadyReviewed = Review::where('user_id', $user)
                                       ->where('product_id', $item->product_id)
                                       ->where('order_id', $order->id)
                                       ->exists();

                if (!$alreadyReviewed) {
                    $eligibleProducts[] = [
                        'product' => $item->product,
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'delivered_at' => $order->delivered_at,
                        'item_details' => [
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'variant' => $item->variant,
                        ]
                    ];
                }
            }
        }

        return response()->json(['success' => true, 'data' => $eligibleProducts]);
    }

    public function helpful($id, Request $request)
    {
        $request->validate([
            'helpful' => 'required|boolean'
        ]);

        $review = Review::findOrFail($id);

        // Prevent users from voting on their own reviews
        if ($review->user_id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot vote on your own review.'
            ], 422);
        }

        // This would typically be stored in a separate review_votes table
        // For now, we'll just increment the counter
        if ($request->helpful) {
            $review->increment('helpful_count');
        } else {
            $review->increment('not_helpful_count');
        }

        return response()->json([
            'success' => true,
            'message' => 'Vote recorded successfully.',
            'data' => [
                'helpful_count' => $review->helpful_count,
                'not_helpful_count' => $review->not_helpful_count,
            ]
        ]);
    }

    public function report($id, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|in:inappropriate,spam,fake,offensive,other',
            'description' => 'nullable|string|max:500'
        ]);

        $review = Review::findOrFail($id);

        // This would typically be stored in a review_reports table
        // For now, we'll just mark the review as reported
        $review->update(['is_reported' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Review reported successfully. Our team will review it shortly.'
        ]);
    }
}
