import z from 'zod';
import { VerseDataType } from './verse-data.types';

export const GeneratePoemHandlerRequestSchema = z.object({
  userId: z.uuid(),
});
export type GeneratePoemHandlerRequestType = z.infer<typeof GeneratePoemHandlerRequestSchema>;

export type GeneratePoemHandlerResponseType = {
  readonly userId: string;
  readonly verseData: VerseDataType;
};

export interface GeneratePoemHandlerInterface {
  (request: GeneratePoemHandlerRequestType): Promise<GeneratePoemHandlerResponseType>;
}
