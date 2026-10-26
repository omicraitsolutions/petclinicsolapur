import emailjs from '@emailjs/browser';
import { ClinicSettings } from '../types';

// Emails are sent straight from the browser through the clinic's connected
// email account (EmailJS), so no server code is involved.

export interface EmailJsParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// The three Email Configuration fields in Settings are stored in the existing
// clinic_settings columns:
//   smtp_host     -> Service ID
//   smtp_email    -> Template ID
//   smtp_password -> Public Key
export function getEmailJsConfig(settings: ClinicSettings) {
  return {
    serviceId: settings.smtpHost || '',
    templateId: settings.smtpEmail || '',
    publicKey: settings.smtpPassword || ''
  };
}

export function isEmailJsConfigured(settings: ClinicSettings): boolean {
  const { serviceId, templateId, publicKey } = getEmailJsConfig(settings);
  return Boolean(serviceId && templateId && publicKey);
}

export async function sendEmailViaEmailJs(params: EmailJsParams, settings: ClinicSettings): Promise<void> {
  const { serviceId, templateId, publicKey } = getEmailJsConfig(settings);

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('Email sending is not set up yet. Open Settings and complete the Email Configuration section.');
  }

  // These names must match the {{variables}} used in the email template.
  const templateParams = {
    to_email: params.to,
    subject: params.subject,
    message: params.html || params.text,
    message_text: params.text,
    clinic_name: settings.clinicName || 'Pet Hospital Solapur',
    from_name: settings.doctorName || settings.clinicName || 'Pet Hospital Solapur'
  };

  await emailjs.send(serviceId, templateId, templateParams, { publicKey });
}
