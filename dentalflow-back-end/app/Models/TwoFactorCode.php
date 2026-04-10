<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TwoFactorCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'code',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Get the user that owns the two factor code.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate a new 6-digit code for the user.
     */
    public static function generateForUser(User $user): self
    {
        // Delete any existing codes for this user
        static::where('user_id', $user->id)->delete();
        
        // Generate new 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        return static::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10), // Code expires in 10 minutes
        ]);
    }

    /**
     * Verify if the code is valid for the user.
     */
    public static function verifyCode(User $user, string $code): bool
    {
        $record = static::where('user_id', $user->id)
            ->where('code', $code)
            ->where('expires_at', '>', now())
            ->first();

        if ($record) {
            // Delete the code after successful verification
            $record->delete();
            return true;
        }

        return false;
    }
}
