import type { VerseDataType } from './verse-data.types';

export type FetchDataHandlerResponseType = {
  readonly registeredUsers: string[];
  readonly userId: string | undefined;
  readonly verseData: VerseDataType | undefined;
};

export interface FetchDataHandlerInterface {
  (userId?: string): Promise<FetchDataHandlerResponseType>;
}
