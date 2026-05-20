<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AdminSettingController extends Controller
{
    public function index()
    {
        $settings = [
            'site' => [
                'name' => setting('site.name', 'KhadiCraft by Goldy'),
                'description' => setting('site.description', 'Authentic handwoven khadi fabrics and bespoke tailoring'),
                'email' => setting('site.email', 'hello@khadicraft.in'),
                'phone' => setting('site.phone', '+91 78300 57297'),
                'address' => setting('site.address', 'Rampur Maniharan, Saharanpur, Uttar Pradesh'),
                'logo' => setting('site.logo'),
                'favicon' => setting('site.favicon'),
            ],
            'contact' => [
                'whatsapp' => setting('contact.whatsapp', '+91 78300 57297'),
                'facebook' => setting('contact.facebook'),
                'instagram' => setting('contact.instagram'),
                'twitter' => setting('contact.twitter'),
                'linkedin' => setting('contact.linkedin'),
            ],
            'shipping' => [
                'free_shipping_above' => setting('shipping.free_shipping_above', 999),
                'standard_shipping' => setting('shipping.standard_shipping', 50),
                'express_shipping' => setting('shipping.express_shipping', 150),
            ],
            'payment' => [
                'cash_on_delivery' => setting('payment.cash_on_delivery', true),
                'online_payment' => setting('payment.online_payment', true),
                'razorpay_key' => setting('payment.razorpay_key'),
                'stripe_key' => setting('payment.stripe_key'),
            ],
            'custom_tailoring' => [
                'enabled' => setting('custom_tailoring.enabled', true),
                'min_days' => setting('custom_tailoring.min_days', 7),
                'max_days' => setting('custom_tailoring.max_days', 21),
                'consultation_fee' => setting('custom_tailoring.consultation_fee', 200),
            ],
            'wholesale' => [
                'enabled' => setting('wholesale.enabled', true),
                'min_order_value' => setting('wholesale.min_order_value', 5000),
                'default_discount' => setting('wholesale.default_discount', 15),
            ],
            'seo' => [
                'meta_title' => setting('seo.meta_title', 'KhadiCraft by Goldy - Handwoven Khadi Fabrics & Custom Tailoring'),
                'meta_description' => setting('seo.meta_description', 'Discover authentic handwoven khadi fabrics and bespoke tailoring at KhadiCraft by Goldy. Premium quality traditional wear from Rampur Maniharan, Saharanpur.'),
                'meta_keywords' => setting('seo.meta_keywords', 'khadi, handloom, fabrics, custom tailoring, traditional wear, saharanpur, rampur maniharan'),
                'google_analytics' => setting('seo.google_analytics'),
                'google_tag_manager' => setting('seo.google_tag_manager'),
            ],
            'maintenance' => [
                'mode' => setting('maintenance.mode', false),
                'message' => setting('maintenance.message', 'We are currently under maintenance. Please check back soon.'),
            ],
        ];

        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'site.name' => 'required|string|max:255',
            'site.description' => 'nullable|string|max:500',
            'site.email' => 'nullable|email',
            'site.phone' => 'nullable|string|max:20',
            'site.address' => 'nullable|string|max:500',
            'site.logo' => 'nullable|image|max:2048',
            'site.favicon' => 'nullable|image|max:512',
            
            'contact.whatsapp' => 'nullable|string|max:20',
            'contact.facebook' => 'nullable|url',
            'contact.instagram' => 'nullable|url',
            'contact.twitter' => 'nullable|url',
            'contact.linkedin' => 'nullable|url',
            
            'shipping.free_shipping_above' => 'nullable|numeric|min:0',
            'shipping.standard_shipping' => 'nullable|numeric|min:0',
            'shipping.express_shipping' => 'nullable|numeric|min:0',
            
            'payment.cash_on_delivery' => 'nullable|boolean',
            'payment.online_payment' => 'nullable|boolean',
            'payment.razorpay_key' => 'nullable|string',
            'payment.stripe_key' => 'nullable|string',
            
            'custom_tailoring.enabled' => 'nullable|boolean',
            'custom_tailoring.min_days' => 'nullable|integer|min:1|max:30',
            'custom_tailoring.max_days' => 'nullable|integer|min:1|max:60',
            'custom_tailoring.consultation_fee' => 'nullable|numeric|min:0',
            
            'wholesale.enabled' => 'nullable|boolean',
            'wholesale.min_order_value' => 'nullable|numeric|min:0',
            'wholesale.default_discount' => 'nullable|numeric|min:0|max:50',
            
            'seo.meta_title' => 'nullable|string|max:255',
            'seo.meta_description' => 'nullable|string|max:500',
            'seo.meta_keywords' => 'nullable|string|max:255',
            'seo.google_analytics' => 'nullable|string',
            'seo.google_tag_manager' => 'nullable|string',
            
            'maintenance.mode' => 'nullable|boolean',
            'maintenance.message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Handle file uploads
        if ($request->hasFile('site.logo')) {
            $logoPath = $request->file('site.logo')->store('settings', 'public');
            setting(['site.logo' => $logoPath]);
        }

        if ($request->hasFile('site.favicon')) {
            $faviconPath = $request->file('site.favicon')->store('settings', 'public');
            setting(['site.favicon' => $faviconPath]);
        }

        // Update all settings
        foreach ($request->except(['site.logo', 'site.favicon']) as $key => $value) {
            if (is_array($value)) {
                foreach ($value as $subKey => $subValue) {
                    $fullKey = $key . '.' . $subKey;
                    setting([$fullKey => $subValue]);
                }
            } else {
                setting([$key => $value]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully.',
            'data' => $this->index()->original['data']
        ]);
    }

    public function uploadAsset(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120', // 5MB max
            'type' => 'required|in:logo,favicon,banner'
        ]);

        $file = $request->file('file');
        $type = $request->type;

        // Validate file type based on upload type
        $allowedMimes = match ($type) {
            'logo' => ['image/jpeg', 'image/png', 'image/svg+xml'],
            'favicon' => ['image/x-icon', 'image/png'],
            'banner' => ['image/jpeg', 'image/png', 'image/webp'],
            default => []
        };

        if (!in_array($file->getMimeType(), $allowedMimes)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid file type for this upload.'
            ], 422);
        }

        $path = $file->store('settings/' . $type, 'public');
        $url = asset('storage/' . $path);

        return response()->json([
            'success' => true,
            'message' => 'Asset uploaded successfully.',
            'data' => [
                'path' => $path,
                'url' => $url,
                'type' => $type
            ]
        ]);
    }

    public function publicSettings()
    {
        $publicSettings = [
            'site' => [
                'name' => setting('site.name', 'KhadiCraft by Goldy'),
                'description' => setting('site.description'),
                'email' => setting('site.email'),
                'phone' => setting('site.phone'),
                'address' => setting('site.address'),
                'logo' => setting('site.logo') ? asset('storage/' . setting('site.logo')) : null,
            ],
            'contact' => [
                'whatsapp' => setting('contact.whatsapp'),
                'facebook' => setting('contact.facebook'),
                'instagram' => setting('contact.instagram'),
                'twitter' => setting('contact.twitter'),
                'linkedin' => setting('contact.linkedin'),
            ],
            'shipping' => [
                'free_shipping_above' => setting('shipping.free_shipping_above', 999),
                'standard_shipping' => setting('shipping.standard_shipping', 50),
                'express_shipping' => setting('shipping.express_shipping', 150),
            ],
            'payment' => [
                'cash_on_delivery' => setting('payment.cash_on_delivery', true),
                'online_payment' => setting('payment.online_payment', true),
            ],
            'custom_tailoring' => [
                'enabled' => setting('custom_tailoring.enabled', true),
                'min_days' => setting('custom_tailoring.min_days', 7),
                'max_days' => setting('custom_tailoring.max_days', 21),
                'consultation_fee' => setting('custom_tailoring.consultation_fee', 200),
            ],
            'wholesale' => [
                'enabled' => setting('wholesale.enabled', true),
                'min_order_value' => setting('wholesale.min_order_value', 5000),
            ],
            'seo' => [
                'meta_title' => setting('seo.meta_title'),
                'meta_description' => setting('seo.meta_description'),
                'meta_keywords' => setting('seo.meta_keywords'),
            ],
            'maintenance' => [
                'mode' => setting('maintenance.mode', false),
                'message' => setting('maintenance.message'),
            ],
        ];

        return response()->json(['success' => true, 'data' => $publicSettings]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'section' => 'required|in:site,contact,shipping,payment,custom_tailoring,wholesale,seo,maintenance'
        ]);

        $section = $request->section;

        // Reset specific section to defaults
        $defaults = match ($section) {
            'site' => [
                'site.name' => 'KhadiCraft by Goldy',
                'site.description' => 'Authentic handwoven khadi fabrics and bespoke tailoring',
                'site.email' => 'hello@khadicraft.in',
                'site.phone' => '+91 78300 57297',
                'site.address' => 'Rampur Maniharan, Saharanpur, Uttar Pradesh',
            ],
            'contact' => [
                'contact.whatsapp' => '+91 78300 57297',
                'contact.facebook' => null,
                'contact.instagram' => null,
                'contact.twitter' => null,
                'contact.linkedin' => null,
            ],
            'shipping' => [
                'shipping.free_shipping_above' => 999,
                'shipping.standard_shipping' => 50,
                'shipping.express_shipping' => 150,
            ],
            'payment' => [
                'payment.cash_on_delivery' => true,
                'payment.online_payment' => true,
                'payment.razorpay_key' => null,
                'payment.stripe_key' => null,
            ],
            'custom_tailoring' => [
                'custom_tailoring.enabled' => true,
                'custom_tailoring.min_days' => 7,
                'custom_tailoring.max_days' => 21,
                'custom_tailoring.consultation_fee' => 200,
            ],
            'wholesale' => [
                'wholesale.enabled' => true,
                'wholesale.min_order_value' => 5000,
                'wholesale.default_discount' => 15,
            ],
            'seo' => [
                'seo.meta_title' => 'KhadiCraft by Goldy - Handwoven Khadi Fabrics & Custom Tailoring',
                'seo.meta_description' => 'Discover authentic handwoven khadi fabrics and bespoke tailoring at KhadiCraft by Goldy. Premium quality traditional wear from Rampur Maniharan, Saharanpur.',
                'seo.meta_keywords' => 'khadi, handloom, fabrics, custom tailoring, traditional wear, saharanpur, rampur maniharan',
                'seo.google_analytics' => null,
                'seo.google_tag_manager' => null,
            ],
            'maintenance' => [
                'maintenance.mode' => false,
                'maintenance.message' => 'We are currently under maintenance. Please check back soon.',
            ],
            default => []
        };

        foreach ($defaults as $key => $value) {
            setting([$key => $value]);
        }

        return response()->json([
            'success' => true,
            'message' => "Settings for '{$section}' reset to defaults.",
            'data' => $this->index()->original['data']
        ]);
    }
}
