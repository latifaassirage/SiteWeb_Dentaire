<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TwoFactorCode;
use App\Mail\TwoFactorCodeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/',
            'phone'    => 'nullable|string|max:20',
        ], [
            'password.regex' => 'Password must contain at least one uppercase letter, one number, and one special character (!@#$%^&*).',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'role'     => 'patient',
        ]);

        // Send email verification
        $user->sendEmailVerificationNotification();

        return response()->json([
            'user'  => $user,
            'message' => 'Registration successful. Please check your email to verify your account.',
            'requires_verification' => true,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        // Check if email is verified
        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email before logging in.',
                'requires_email_verification' => true,
            ], 403);
        }

        // Generate and send 2FA code
        $twoFactorCode = TwoFactorCode::generateForUser($user);
        Mail::to($user->email)->send(new TwoFactorCodeMail($twoFactorCode->code));

        return response()->json([
            'message' => '2FA code sent to your email.',
            'requires_2fa' => true,
            'user_id' => $user->id,
        ]);
    }

    public function verify2FA(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'code' => 'required|string|size:6',
        ]);

        $user = User::findOrFail($request->user_id);

        if (TwoFactorCode::verifyCode($user, $request->code)) {
            $token = $user->createToken('auth_token')->plainTextToken;
            
            return response()->json([
                'user'  => $user,
                'token' => $token,
                'message' => 'Login successful.',
            ]);
        }

        return response()->json([
            'message' => 'Invalid or expired 2FA code.',
        ], 422);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        // Find user by email verification token (using email hash)
        $users = User::all();
        $user = null;
        
        foreach ($users as $u) {
            if (sha1($u->getEmailForVerification()) === $request->token) {
                $user = $u;
                break;
            }
        }

        if (!$user) {
            return response()->json(['message' => 'Invalid verification token.'], 422);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 422);
        }

        $user->markEmailAsVerified();

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => $user,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}