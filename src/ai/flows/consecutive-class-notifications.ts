// src/ai/flows/consecutive-class-notifications.ts
'use server';

/**
 * @fileOverview Manages notifications for consecutive classes, providing soft notifications and full-screen reminders.
 *
 * - consecutiveClassNotification - A function that determines and provides appropriate notifications for consecutive classes.
 * - ConsecutiveClassNotificationInput - The input type for the consecutiveClassNotification function.
 * - ConsecutiveClassNotificationOutput - The return type for the consecutiveClassNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConsecutiveClassNotificationInputSchema = z.object({
  currentClass: z.object({
    subject: z.string().describe('The subject of the current class.'),
    room: z.string().describe('The room number of the current class.'),
    endTime: z.string().describe('The end time of the current class (e.g., 10:50 AM).'),
  }),
  nextClass: z.object({
    subject: z.string().describe('The subject of the next class.'),
    room: z.string().describe('The room number of the next class.'),
    startTime: z.string().describe('The start time of the next class (e.g., 11:00 AM).'),
    endTime: z.string().describe('The end time of the next class (e.g., 11:50 AM).'),
  }),
  isConsecutive: z.boolean().describe('Whether the next class is immediately after the current class.'),
});

export type ConsecutiveClassNotificationInput = z.infer<typeof ConsecutiveClassNotificationInputSchema>;

const ConsecutiveClassNotificationOutputSchema = z.object({
  notificationType: z.enum(['alarm', 'soft_notification', 'full_screen_reminder', 'none']).describe('The type of notification to display.'),
  message: z.string().describe('The message to display in the notification.'),
});

export type ConsecutiveClassNotificationOutput = z.infer<typeof ConsecutiveClassNotificationOutputSchema>;

export async function consecutiveClassNotification(input: ConsecutiveClassNotificationInput): Promise<ConsecutiveClassNotificationOutput> {
  return consecutiveClassNotificationFlow(input);
}

const consecutiveClassNotificationPrompt = ai.definePrompt({
  name: 'consecutiveClassNotificationPrompt',
  input: {schema: ConsecutiveClassNotificationInputSchema},
  output: {schema: ConsecutiveClassNotificationOutputSchema},
  prompt: `You are a helpful assistant designed to determine the appropriate notification type for students with consecutive classes.

  Your goal is to remind the student about their upcoming class.
  The user is currently in a class that is about to end, and has another one starting shortly after.

  Here are the details:
  Current Class: Subject: {{{currentClass.subject}}}, Room: {{{currentClass.room}}}, End Time: {{{currentClass.endTime}}}
  Next Class: Subject: {{{nextClass.subject}}}, Room: {{{nextClass.room}}}, Start Time: {{{nextClass.startTime}}}
  Is Consecutive: {{{isConsecutive}}}

  The notification is being triggered a few minutes before the current class ends.
  
  Based on this, you must generate a full-screen reminder. The message should be friendly and encouraging, telling the user to get ready for their next class. For example: "Time to pack up! Your next class is starting soon."
  
  Do not select 'soft_notification', 'alarm', or 'none'. You must use 'full_screen_reminder'.

  Return the notification type and a descriptive message.
`,
});

const consecutiveClassNotificationFlow = ai.defineFlow(
  {
    name: 'consecutiveClassNotificationFlow',
    inputSchema: ConsecutiveClassNotificationInputSchema,
    outputSchema: ConsecutiveClassNotificationOutputSchema,
  },
  async input => {
    const {output} = await consecutiveClassNotificationPrompt(input);
    return output!;
  }
);
