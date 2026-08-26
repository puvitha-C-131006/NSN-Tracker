import { supabase } from './supabase';

export const sendEmail = async (to: string | string[], subject: string, message: string) => {
  try {
    if (!to) return;
    
    // Filter out empty strings if array and join with comma
    const toAddress = Array.isArray(to) ? to.filter(Boolean).join(', ') : to;
    if (!toAddress.trim()) return;

    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: toAddress,
        subject: subject,
        message: message
      }
    });

    if (error) {
      console.error('Error invoking send-email function:', error);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

export const sendWelcomeEmail = async (engineerEmail: string, name: string) => {
  if (!engineerEmail) return;
  await sendEmail(
    engineerEmail,
    "Welcome to UST-Nokia Account",
    `Welcome to the UST-Nokia account, ${name}! We're excited to have you on board.`
  );
};

export const sendRampDownEmail = async (engineerEmail: string, spocEmail: string, date: string) => {
  const recipients = [engineerEmail, spocEmail].filter(Boolean);
  if (recipients.length === 0) return;
  
  await sendEmail(
    recipients,
    "Project Ramp Down Notification",
    `Your project is scheduled for ramp down on ${date}.`
  );
};

export const sendNoticePeriodEmail = async (spocEmail: string, engineerName: string, date: string) => {
  if (!spocEmail) return;
  await sendEmail(
    spocEmail,
    "Resignation Notice",
    `The following engineer has applied for resignation in the portal. Employee: ${engineerName}. Last working date: ${date}.`
  );
};

export const sendMovementEmail = async (engineerEmail: string, spocEmail: string) => {
  const recipients = [engineerEmail, spocEmail].filter(Boolean);
  if (recipients.length === 0) return;
  
  await sendEmail(
    recipients,
    "Assignment Movement Notification",
    "As per customer requirements, you have been moved to a new assignment."
  );
};

export const sendAdvancementEmail = async (engineerEmail: string, spocEmail: string) => {
  const recipients = [engineerEmail, spocEmail].filter(Boolean);
  if (recipients.length === 0) return;
  
  await sendEmail(
    recipients,
    "Advancement Notification",
    "Appreciate your performance. You have been elevated to the next level."
  );
};
