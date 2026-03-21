import { UUID } from './uuid.types';
import { VerseDataType } from './verse-data.types';

export type GeneratePoemHandlerResponseType = {
  readonly userId: UUID;
  readonly verseData: VerseDataType;
};

export interface GeneratePoemHandlerInterface {
  (userId: UUID): Promise<GeneratePoemHandlerResponseType>;
}
