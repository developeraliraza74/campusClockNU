import { config } from 'dotenv';
config();

import '@/ai/flows/timetable-ocr-analysis.ts';
import '@/ai/flows/consecutive-class-notifications.ts';
import '@/ai/flows/reasoning-alarm-scheduler.ts';