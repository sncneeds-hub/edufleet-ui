/**
 * OTP Service for Email-based Authentication
 * 
 * This service handles:
 * - OTP generation
 * - OTP validation
 * - Email sending (simulated)
 * - OTP expiration
 */

interface OTPRecord {
  email: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map<string, OTPRecord>();

// Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;

export const otpService = {
  /**
   * Generate a random OTP
   */
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  /**
   * Send OTP to email (simulated)
   */
  async sendOTP(email: string): Promise<{ success: boolean; message: string; otp?: string }> {
    try {
      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

      // Store OTP
      otpStore.set(email, {
        email,
        otp,
        expiresAt,
        attempts: 0,
      });

      // In production, send actual email here
      console.log(`📧 OTP for ${email}: ${otp} (expires in ${OTP_EXPIRY_MINUTES} minutes)`);

      // For demo purposes, return OTP in response (remove in production)
      return {
        success: true,
        message: `OTP sent to ${email}`,
        otp, // Remove this in production
      };
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
      };
    }
  },

  /**
   * Verify OTP
   */
  verifyOTP(email: string, otp: string): { success: boolean; message: string } {
    const record = otpStore.get(email);

    if (!record) {
      return {
        success: false,
        message: 'No OTP found. Please request a new one.',
      };
    }

    // Check expiration
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.',
      };
    }

    // Check attempts
    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(email);
      return {
        success: false,
        message: 'Maximum attempts exceeded. Please request a new OTP.',
      };
    }

    // Verify OTP
    if (record.otp !== otp) {
      record.attempts += 1;
      return {
        success: false,
        message: `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining.`,
      };
    }

    // Success - remove OTP from store
    otpStore.delete(email);
    return {
      success: true,
      message: 'OTP verified successfully',
    };
  },

  /**
   * Resend OTP
   */
  async resendOTP(email: string): Promise<{ success: boolean; message: string; otp?: string }> {
    // Remove old OTP if exists
    otpStore.delete(email);

    // Send new OTP
    return this.sendOTP(email);
  },

  /**
   * Clear OTP for email
   */
  clearOTP(email: string): void {
    otpStore.delete(email);
  },

  /**
   * Get OTP info (for debugging)
   */
  getOTPInfo(email: string): OTPRecord | null {
    const record = otpStore.get(email);
    return record || null;
  },
};
