import z from 'zod';
import type { VerseDataType } from './verse-data.types';

export const GeneratePoemHandlerRequestSchema = z.object({
  userId: z.uuid(),
  keywords: z.array(z.string()).optional(),
});
export type GeneratePoemHandlerRequestType = z.infer<typeof GeneratePoemHandlerRequestSchema>;

export type GeneratePoemHandlerResponseType = {
  readonly userId: string;
  readonly verseData: VerseDataType;
};

export interface GeneratePoemHandlerInterface {
  (request: GeneratePoemHandlerRequestType): Promise<GeneratePoemHandlerResponseType>;
}
