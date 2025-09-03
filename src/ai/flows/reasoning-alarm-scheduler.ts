// src/ai/flows/reasoning-alarm-scheduler.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for intelligently scheduling alarms before classes.
 *
 * - reasoningAlarmScheduler - A function that handles the intelligent alarm scheduling process.
 * - ReasoningAlarmSchedulerInput - The input type for the reasoningAlarmScheduler function.
 * - ReasoningAlarmSchedulerOutput - The return type for the reasoningAlarmScheduler function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasoningAlarmSchedulerInputSchema = z.object({
  className: z.string().describe('The name of the class.'),
  roomNumber: z.string().describe('The room number where the class is held.'),
  startTime: z.string().describe('The start time of the class in HH:MM format.'),
  currentTime: z.string().describe('The current time in HH:MM format.'),
  currentLocation: z
    .string()
    .describe(
      'The user current location. Possible values: InsideClass, NotInsideClass.'
    ),
});
export type ReasoningAlarmSchedulerInput = z.infer<
  typeof ReasoningAlarmSchedulerInputSchema
>;

const ReasoningAlarmSchedulerOutputSchema = z.object({
  shouldSetAlarm: z
    .boolean()
    .describe(
      'Whether or not the alarm should be set based on the current location and time.'
    ),
  alarmTime: z
    .string()
    .optional()
    .describe('The time the alarm should be set for in HH:MM format.'),
  reason: z
    .string()
    .describe('The reason why the alarm should or should not be set.'),
});
export type ReasoningAlarmSchedulerOutput = z.infer<
  typeof ReasoningAlarmSchedulerOutputSchema
>;

export async function reasoningAlarmScheduler(
  input: ReasoningAlarmSchedulerInput
): Promise<ReasoningAlarmSchedulerOutput> {
  return reasoningAlarmSchedulerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reasoningAlarmSchedulerPrompt',
  input: {schema: ReasoningAlarmSchedulerInputSchema},
  output: {schema: ReasoningAlarmSchedulerOutputSchema},
  prompt: `You are an AI assistant that helps users intelligently schedule alarms for their classes.

You will receive the following information about the class:
- Class Name: {{{className}}}
- Room Number: {{{roomNumber}}}
- Start Time: {{{startTime}}}
- Current Time: {{{currentTime}}}
- Current Location: {{{currentLocation}}}

Consider the following factors to determine if an alarm should be set:
- The user should be reminded of the class 10 minutes before it starts.
- If the user is already in the class location (InsideClass), the alarm should not be set.
- If the user is not in the class location (NotInsideClass) , the alarm should be set.
- Take into account that if current time is later than class start time, the alarm should not be set.

Based on this information, determine whether an alarm should be set and the reason for your decision. Also determine the alarm time.

Output should be in JSON format.
`,
});

const reasoningAlarmSchedulerFlow = ai.defineFlow(
  {
    name: 'reasoningAlarmSchedulerFlow',
    inputSchema: ReasoningAlarmSchedulerInputSchema,
    outputSchema: ReasoningAlarmSchedulerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
