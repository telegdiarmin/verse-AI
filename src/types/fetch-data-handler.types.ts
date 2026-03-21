import { UUID } from './uuid.types';
import { VerseDataType } from './verse-data.types';

export type FetchDataHandlerResponseType = {
  readonly registeredUsers: string[];
  readonly userId: UUID | undefined;
  readonly verseData: VerseDataType | undefined;
};

export interface FetchDataHandlerInterface {
  (userId?: UUID): Promise<FetchDataHandlerResponseType>;
}
