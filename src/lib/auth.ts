import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: ["http://localhost:3000"],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const VerificationUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Prisma blog"<someone@gmail.com>',
          to: user.email,
          subject: "Please verify you email",
          html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #0d1b2a 0%, #1a0033 50%, #ff006e 100%);
            padding: 40px 20px;
            text-align: center;
            color: #ffffff;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '✨ ⚡ 🎌 ⚡ ✨';
            position: absolute;
            top: 10px;
            left: 0;
            right: 0;
            font-size: 20px;
            opacity: 0.6;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            letter-spacing: 1px;
        }
        
        .header p {
            font-size: 14px;
            opacity: 0.95;
            font-style: italic;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #333;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 30px;
        }
        
        .message p {
            margin-bottom: 15px;
        }
        
        .verification-section {
            background: linear-gradient(135deg, #f0f0f0 0%, #fafafa 100%);
            border-left: 4px solid #ff006e;
            padding: 20px;
            margin: 30px 0;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(255, 0, 110, 0.15);
        }
        
        .verification-section p {
            font-size: 14px;
            color: #666;
            margin-bottom: 12px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 0, 110, 0.4);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .cta-button:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 8px 25px rgba(255, 0, 110, 0.6), 0 0 20px rgba(131, 56, 236, 0.3);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .alternative-link {
            font-size: 13px;
            color: #666;
            word-break: break-all;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 6px;
            margin: 20px 0;
            border: 1px dashed #ff006e;
        }
        
        .alternative-link a {
            color: #8338ec;
            text-decoration: none;
            font-weight: 600;
        }
        
        .alternative-link a:hover {
            text-decoration: underline;
            color: #ff006e;
        }
        
        .footer {
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #eee;
        }
        
        .footer-text {
            font-size: 13px;
            color: #999;
            line-height: 1.6;
        }
        
        .footer-text p {
            margin-bottom: 10px;
        }
        
        .footer-links {
            margin-top: 15px;
            font-size: 12px;
        }
        
        .footer-links a {
            color: #8338ec;
            text-decoration: none;
            margin: 0 10px;
            font-weight: 600;
        }
        
        .footer-links a:hover {
            color: #ff006e;
            text-decoration: underline;
        }
        
        .divider {
            border: none;
            border-top: 1px solid #eee;
            margin: 20px 0;
        }
        
        .expiry-warning {
            background-color: #fff0f5;
            border-left: 4px solid #ff006e;
            padding: 12px 15px;
            margin: 20px 0;
            border-radius: 6px;
            font-size: 13px;
            color: #c2185b;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>⚡ VERIFY YOUR ACCOUNT ⚡</h1>
            <p>Complete the quest to unlock your gateway to the anime universe!</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">おはよう、${user.name}! 🎌</div>
            
            <div class="message">
                <p>Welcome to our community, fellow anime enthusiast! We're pumped to have you join us!</p>
                <p>Just one final step to level up your account—please verify your email address by clicking the epic button below.</p>
            </div>
            
            <!-- Verification Section -->
            <div class="verification-section">
                <p><strong>💪 Why verify your account?</strong></p>
                <p>Verification ensures your account is secure and you'll get notifications about new anime releases, updates, and exclusive member content. Plus, it protects your profile like a guardian angel!</p>
            </div>
            
            <!-- CTA Button -->
            <div class="button-container">
                <a href="${VerificationUrl}" class="cta-button">ACTIVATE ACCOUNT</a>
            </div>
            
            <!-- Expiry Warning -->
            <div class="expiry-warning">
                ⏳ ATTENTION: This verification link activates in 24 hours. Don't miss your chance!
            </div>
            
            <!-- Alternative Link -->
            <div class="alternative-link">
                <p><strong>Or copy this spell scroll in your browser:</strong></p>
                <p><a href="${VerificationUrl}">{{verificationUrl}}</a></p>
            </div>
            
            <!-- Additional Info -->
            <div class="message" style="margin-top: 30px;">
                <p><strong>Didn't create this account?</strong> No worries! Just ignore this email and we'll pretend it never happened. 🤐</p>
                <p>Have questions or need help? Our support team is standing by to assist you on your journey!</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                <p>&copy; 2024 Your Anime Community. すべての権利を保有しています。</p>
                <p>This is an automated message. Please don't reply to this email.</p>
            </div>
            <div class="footer-links">
                <a href="https://yourwebsite.com">Website</a>
                <a href="https://yourwebsite.com/privacy">Privacy</a>
                <a href="https://yourwebsite.com/terms">Terms</a>
            </div>
        </div>
    </div>
</body>
</html>`,
        });

        console.log("Message sent:", info.messageId);
      } catch (err) {
        console.error(err);
      }
    },
  },
});
