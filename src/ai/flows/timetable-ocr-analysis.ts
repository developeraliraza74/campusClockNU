'use server';

/**
 * @fileOverview This flow extracts timetable data from an image using OCR.
 *
 * - timetableOcrAnalysis - Analyzes an image of a timetable and extracts class schedule details.
 * - TimetableOcrAnalysisInput - The input type for the timetableOcrAnalysis function.
 * - TimetableOcrAnalysisOutput - The return type for the timetableOcrAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TimetableOcrAnalysisInputSchema = z.object({
  timetableImageDataUri: z
    .string()
    .describe(
      'A photo of a timetable, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // correct the typo here
    ),
});
export type TimetableOcrAnalysisInput = z.infer<typeof TimetableOcrAnalysisInputSchema>;

const TimetableOcrAnalysisOutputSchema = z.object({
  schedule: z
    .array(
      z.object({
        subject: z.string().describe('The name of the subject.'),
        roomNumber: z.string().describe('The room number where the class is held.'),
        duration: z.string().describe('The duration of the class (e.g., 1 hour, 1.5 hours).'),
        startTime: z.string().describe('The starting time of the class (e.g., 9:00 AM).'),
        dayOfWeek: z.string().describe('The day of the week for the class (e.g., Monday, Tuesday).'),
      })
    )
    .describe('The extracted schedule details from the timetable image.'),
});
export type TimetableOcrAnalysisOutput = z.infer<typeof TimetableOcrAnalysisOutputSchema>;

export async function timetableOcrAnalysis(
  input: TimetableOcrAnalysisInput
): Promise<TimetableOcrAnalysisOutput> {
  return timetableOcrAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'timetableOcrAnalysisPrompt',
  input: {schema: TimetableOcrAnalysisInputSchema},
  output: {schema: TimetableOcrAnalysisOutputSchema},
  prompt: `You are an AI assistant that extracts timetable data from images. Given an image of a timetable, extract the schedule details, including subjects, room numbers, durations, start times, and days of the week.  The timetable may not be perfectly aligned, so you may need to reason about it.

Timetable Image: {{media url=timetableImageDataUri}}

Output the data in JSON format.
`,
});

const timetableOcrAnalysisFlow = ai.defineFlow(
  {
    name: 'timetableOcrAnalysisFlow',
    inputSchema: TimetableOcrAnalysisInputSchema,
    outputSchema: TimetableOcrAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
