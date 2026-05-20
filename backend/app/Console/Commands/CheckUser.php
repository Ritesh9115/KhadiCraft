<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckUser extends Command
{
    protected $signature = 'check:user {email}';
    protected $description = 'Check if user exists in database';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();
        
        if ($user) {
            $this->info("✅ User FOUND - Email: {$email}, ID: {$user->id}, Name: {$user->name}");
            $this->info("Password Hash: " . $user->password);
        } else {
            $this->error("❌ User NOT FOUND - Email: {$email}");
        }
        
        return Command::SUCCESS;
    }
}
