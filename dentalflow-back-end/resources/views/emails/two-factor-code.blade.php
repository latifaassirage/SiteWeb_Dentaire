<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Two-Factor Authentication Code - DentalFlow</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1a2b4a;
        }
        .code-container {
            background-color: #f8f9fa;
            border: 2px dashed #007bff;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 8px;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #007bff;
            font-family: monospace;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #666;
        }
        .warning {
            color: #dc3545;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">DentalFlow</div>
            <h2>Two-Factor Authentication</h2>
        </div>
        
        <p>Hello,</p>
        <p>You requested a two-factor authentication code to access your DentalFlow account.</p>
        
        <div class="code-container">
            <div class="code">{{ $code }}</div>
        </div>
        
        <p><strong>This code will expire in 10 minutes.</strong></p>
        <p class="warning">If you did not request this code, please secure your account immediately.</p>
        
        <div class="footer">
            <p>Thank you for using DentalFlow!</p>
            <p><small>This is an automated message, please do not reply.</small></p>
        </div>
    </div>
</body>
</html>
