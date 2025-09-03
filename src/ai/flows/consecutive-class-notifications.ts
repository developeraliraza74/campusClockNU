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
  }).optional(),
  nextClass: z.object({
    subject: z.string().describe('The subject of the next class.'),
    room: z.string().describe('The room number of the next class.'),
    startTime: z.string().describe('The start time of the next class (e.g., 11:00 AM).'),
    endTime: z.string().describe('The end time of the next class (e.g., 11:50 AM).'),
  }).optional(),
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

  Given the details of the current class and the next class, determine whether to display an alarm, a soft notification, a full-screen reminder, or no notification.

  Here are the details:
  Current Class: {{#if currentClass}}Subject: {{{currentClass.subject}}}, Room: {{{currentClass.room}}}, End Time: {{{currentClass.endTime}}}{{else}}None{{/if}}
  Next Class: {{#if nextClass}}Subject: {{{nextClass.subject}}}, Room: {{{nextClass.room}}}, Start Time: {{{nextClass.startTime}}}, End Time: {{{nextClass.endTime}}}{{else}}None{{/if}}
  Is Consecutive: {{{isConsecutive}}}

  If the classes are consecutive, provide a soft notification and a full-screen reminder with the subject, room, and time range of the next class. If not consecutive or no next class, do not override the normal alarm scheduling.

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
