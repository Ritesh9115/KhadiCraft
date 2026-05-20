<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Customer\ProductController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\CustomOrderController;
use App\Http\Controllers\Customer\AppointmentController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Customer\MeasurementController;
use App\Http\Controllers\Customer\ReviewController;
use App\Http\Controllers\Customer\WholesaleController;
use App\Http\Controllers\Customer\PaymentController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminCustomOrderController;
use App\Http\Controllers\Admin\AdminAppointmentController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminInventoryController;
use App\Http\Controllers\Admin\AdminWholesaleController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminSettingController;
use App\Http\Controllers\Admin\AdminBannerController;
use App\Http\Controllers\Tailor\TailorController;
use App\Http\Controllers\ChatbotController;

// ─── PUBLIC ROUTES ───────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register',          [AuthController::class, 'register']);
    Route::post('login',             [AuthController::class, 'login']);
    Route::post('send-otp',          [AuthController::class, 'sendOtp']);
    Route::post('verify-otp',        [AuthController::class, 'verifyOtp']);
    Route::post('forgot-password',   [AuthController::class, 'forgotPassword']);
    Route::post('reset-password',    [AuthController::class, 'resetPassword']);
});

// Public product & catalog
Route::get('products',               [ProductController::class, 'index']);
Route::get('products/{slug}',        [ProductController::class, 'show']);
Route::get('categories',             [ProductController::class, 'categories']);
Route::get('categories/{slug}',      [ProductController::class, 'categoryProducts']);
Route::get('fabric-types',           [ProductController::class, 'fabricTypes']);
Route::get('banners',                [AdminBannerController::class, 'publicBanners']);
Route::get('reviews/{productId}',    [ReviewController::class, 'productReviews']);
Route::get('settings/public',        [AdminSettingController::class, 'publicSettings']);

// Chatbot
Route::post('chatbot',               [ChatbotController::class, 'respond']);

// Public wholesale application (no login required)
Route::post('wholesale/apply',       [WholesaleController::class, 'apply']);

// ─── AUTHENTICATED ROUTES ────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('auth/logout',       [AuthController::class, 'logout']);
    Route::get('auth/me',            [AuthController::class, 'me']);

    // ── PROFILE ──
    Route::prefix('profile')->group(function () {
        Route::get('/',              [ProfileController::class, 'show']);
        Route::put('/',              [ProfileController::class, 'update']);
        Route::post('avatar',        [ProfileController::class, 'uploadAvatar']);
        Route::get('addresses',      [ProfileController::class, 'addresses']);
        Route::post('addresses',     [ProfileController::class, 'addAddress']);
        Route::put('addresses/{id}', [ProfileController::class, 'updateAddress']);
        Route::delete('addresses/{id}', [ProfileController::class, 'deleteAddress']);
        Route::put('addresses/{id}/default', [ProfileController::class, 'setDefaultAddress']);
    });

    // ── MEASUREMENTS ──
    Route::prefix('measurements')->group(function () {
        Route::get('/',              [MeasurementController::class, 'index']);
        Route::post('/',             [MeasurementController::class, 'store']);
        Route::put('/{id}',          [MeasurementController::class, 'update']);
        Route::delete('/{id}',       [MeasurementController::class, 'destroy']);
        Route::put('/{id}/default',  [MeasurementController::class, 'setDefault']);
    });

    // ── ORDERS ──
    Route::prefix('orders')->group(function () {
        Route::get('/',              [OrderController::class, 'index']);
        Route::post('/',             [OrderController::class, 'store']);
        Route::get('/{orderNumber}', [OrderController::class, 'show']);
        Route::post('/{id}/cancel',  [OrderController::class, 'cancel']);
        Route::get('/{id}/invoice',  [OrderController::class, 'invoice']);
        Route::get('/{orderNumber}/track', [OrderController::class, 'track']);
    });

    // ── CUSTOM ORDERS ──
    Route::prefix('custom-orders')->group(function () {
        Route::get('/',              [CustomOrderController::class, 'index']);
        Route::post('/',             [CustomOrderController::class, 'store']);
        Route::get('/{number}',      [CustomOrderController::class, 'show']);
        Route::post('/{id}/cancel',  [CustomOrderController::class, 'cancel']);
        Route::post('/{id}/upload-reference', [CustomOrderController::class, 'uploadReference']);
    });

    // ── APPOINTMENTS ──
    Route::prefix('appointments')->group(function () {
        Route::get('/',              [AppointmentController::class, 'index']);
        Route::post('/',             [AppointmentController::class, 'store']);
        Route::get('/slots',         [AppointmentController::class, 'availableSlots']);
        Route::get('/{id}',          [AppointmentController::class, 'show']);
        Route::put('/{id}/cancel',   [AppointmentController::class, 'cancel']);
        Route::put('/{id}/reschedule', [AppointmentController::class, 'reschedule']);
    });

    // ── REVIEWS ──
    Route::post('reviews',           [ReviewController::class, 'store']);
    Route::put('reviews/{id}',       [ReviewController::class, 'update']);
    Route::delete('reviews/{id}',    [ReviewController::class, 'destroy']);

    // ── PAYMENTS ──
    Route::prefix('payments')->group(function () {
        Route::post('/create-order',   [PaymentController::class, 'createOrder']);
        Route::post('/verify',         [PaymentController::class, 'verify']);
        Route::get('/history',         [PaymentController::class, 'history']);
    });

    // ── WHOLESALE ──
    Route::prefix('wholesale')->group(function () {
        Route::post('/register',       [WholesaleController::class, 'register']);
        Route::get('/status',          [WholesaleController::class, 'status']);
        Route::post('/quote-request',  [WholesaleController::class, 'requestQuote']);
        Route::get('/quotes',          [WholesaleController::class, 'myQuotes']);
    });

    // ── NOTIFICATIONS ──
    Route::get('notifications',      [ProfileController::class, 'notifications']);
    Route::put('notifications/{id}/read', [ProfileController::class, 'markRead']);
    Route::put('notifications/read-all', [ProfileController::class, 'markAllRead']);

    // ─── ADMIN ROUTES ────────────────────────────────────────
    Route::middleware('role:admin,staff')->prefix('admin')->group(function () {

        // Dashboard
        Route::get('dashboard',      [AdminDashboardController::class, 'index']);
        Route::get('dashboard/stats', [AdminDashboardController::class, 'stats']);

        // Products
        Route::apiResource('products', AdminProductController::class);
        Route::post('products/{id}/images',          [AdminProductController::class, 'uploadImages']);
        Route::delete('products/{id}/images/{imgId}',[AdminProductController::class, 'deleteImage']);
        Route::post('products/{id}/variants',        [AdminProductController::class, 'addVariant']);
        Route::put('products/{id}/variants/{vid}',   [AdminProductController::class, 'updateVariant']);
        Route::delete('products/{id}/variants/{vid}',[AdminProductController::class, 'deleteVariant']);
        Route::put('products/{id}/stock',            [AdminProductController::class, 'updateStock']);
        Route::put('products/{id}/toggle',           [AdminProductController::class, 'toggle']);
        Route::put('products/{id}/featured',         [AdminProductController::class, 'toggleFeatured']);
        Route::put('products/bulk-action',           [AdminProductController::class, 'bulkAction']);

        // Categories
        Route::apiResource('categories', AdminCategoryController::class);
        Route::put('categories/{id}/toggle',         [AdminCategoryController::class, 'toggle']);
        Route::put('categories/reorder',             [AdminCategoryController::class, 'reorder']);

        // Orders
        Route::get('orders',                         [AdminOrderController::class, 'index']);
        Route::get('orders/{id}',                    [AdminOrderController::class, 'show']);
        Route::put('orders/{id}/status',             [AdminOrderController::class, 'updateStatus']);
        Route::put('orders/{id}/payment-status',     [AdminOrderController::class, 'updatePaymentStatus']);
        Route::put('orders/{id}/tracking',           [AdminOrderController::class, 'updateTracking']);
        Route::get('orders/{id}/invoice',            [AdminOrderController::class, 'generateInvoice']);
        Route::post('orders/{id}/notes',             [AdminOrderController::class, 'addNote']);

        // Custom Orders
        Route::get('custom-orders',                  [AdminCustomOrderController::class, 'index']);
        Route::get('custom-orders/{id}',             [AdminCustomOrderController::class, 'show']);
        Route::put('custom-orders/{id}/status',      [AdminCustomOrderController::class, 'updateStatus']);
        Route::put('custom-orders/{id}/assign',      [AdminCustomOrderController::class, 'assignTailor']);
        Route::put('custom-orders/{id}/price',       [AdminCustomOrderController::class, 'setPrice']);
        Route::post('custom-orders/{id}/notes',      [AdminCustomOrderController::class, 'addNote']);
        Route::get('custom-orders/{id}/stages',      [AdminCustomOrderController::class, 'getStages']);

        // Appointments
        Route::get('appointments',                   [AdminAppointmentController::class, 'index']);
        Route::get('appointments/{id}',              [AdminAppointmentController::class, 'show']);
        Route::put('appointments/{id}/status',       [AdminAppointmentController::class, 'updateStatus']);
        Route::put('appointments/{id}/assign',       [AdminAppointmentController::class, 'assignStaff']);
        Route::post('appointments/{id}/notes',       [AdminAppointmentController::class, 'addNote']);
        Route::get('appointments/calendar',          [AdminAppointmentController::class, 'calendar']);

        // Users / Customers
        Route::get('users',                          [AdminUserController::class, 'index']);
        Route::get('users/{id}',                     [AdminUserController::class, 'show']);
        Route::put('users/{id}',                     [AdminUserController::class, 'update']);
        Route::put('users/{id}/toggle',              [AdminUserController::class, 'toggle']);
        Route::put('users/{id}/role',                [AdminUserController::class, 'changeRole']);
        Route::delete('users/{id}',                  [AdminUserController::class, 'destroy']);
        Route::get('tailors',                        [AdminUserController::class, 'tailors']);
        Route::get('staff',                          [AdminUserController::class, 'staff']);

        // Inventory
        Route::get('inventory',                      [AdminInventoryController::class, 'index']);
        Route::get('inventory/low-stock',            [AdminInventoryController::class, 'lowStock']);
        Route::post('inventory/adjust',              [AdminInventoryController::class, 'adjust']);
        Route::get('inventory/logs',                 [AdminInventoryController::class, 'logs']);
        Route::get('inventory/{productId}/logs',     [AdminInventoryController::class, 'productLogs']);

        // Wholesale
        Route::get('wholesale/buyers',               [AdminWholesaleController::class, 'buyers']);
        Route::put('wholesale/buyers/{id}/status',   [AdminWholesaleController::class, 'updateStatus']);
        Route::put('wholesale/buyers/{id}/discount', [AdminWholesaleController::class, 'setDiscount']);
        Route::get('wholesale/quotes',               [AdminWholesaleController::class, 'quotes']);
        Route::put('wholesale/quotes/{id}',          [AdminWholesaleController::class, 'updateQuote']);
        Route::get('wholesale/quotes/{id}/invoice',  [AdminWholesaleController::class, 'generateInvoice']);

        // Reports
        Route::get('reports/sales',                  [AdminReportController::class, 'sales']);
        Route::get('reports/orders',                 [AdminReportController::class, 'orders']);
        Route::get('reports/products',               [AdminReportController::class, 'products']);
        Route::get('reports/customers',              [AdminReportController::class, 'customers']);
        Route::get('reports/inventory',              [AdminReportController::class, 'inventory']);
        Route::get('reports/custom-orders',          [AdminReportController::class, 'customOrders']);
        Route::get('reports/tailor-performance',     [AdminReportController::class, 'tailorPerformance']);
        Route::get('reports/export/{type}',          [AdminReportController::class, 'export']);

        // Settings
        Route::get('settings',                       [AdminSettingController::class, 'index']);
        Route::put('settings',                       [AdminSettingController::class, 'update']);
        Route::post('settings/upload',               [AdminSettingController::class, 'uploadAsset']);

        // Banners
        Route::apiResource('banners', AdminBannerController::class);
        Route::put('banners/{id}/toggle',            [AdminBannerController::class, 'toggle']);

        // Reviews
        Route::get('reviews',                        [AdminOrderController::class, 'reviews']);
        Route::put('reviews/{id}/approve',           [AdminOrderController::class, 'approveReview']);
        Route::put('reviews/{id}/reply',             [AdminOrderController::class, 'replyReview']);
        Route::delete('reviews/{id}',                [AdminOrderController::class, 'deleteReview']);

        // Fabric Types
        Route::apiResource('fabric-types', AdminProductController::class);

        // Time Slots
        Route::get('time-slots',                     [AdminAppointmentController::class, 'timeSlots']);
        Route::post('time-slots',                    [AdminAppointmentController::class, 'createSlot']);
        Route::put('time-slots/{id}',                [AdminAppointmentController::class, 'updateSlot']);
        Route::delete('time-slots/{id}',             [AdminAppointmentController::class, 'deleteSlot']);
    });

    // ─── TAILOR ROUTES ───────────────────────────────────────
    Route::middleware('role:tailor')->prefix('tailor')->group(function () {
        Route::get('dashboard',                      [TailorController::class, 'dashboard']);
        Route::get('assigned-orders',                [TailorController::class, 'assignedOrders']);
        Route::get('orders/{id}',                    [TailorController::class, 'orderDetail']);
        Route::put('orders/{id}/stage',              [TailorController::class, 'updateStage']);
        Route::post('orders/{id}/notes',             [TailorController::class, 'addNote']);
        Route::get('workload',                       [TailorController::class, 'workload']);
    });
});
