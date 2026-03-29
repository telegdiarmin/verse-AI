import z from 'zod';
import type { VerseDataType } from './verse-data.types';
import type { UserDataType } from './user-data.types';

export const FetchDataHandlerRequestSchema = z.object({
  userId: z.union([z.uuid(), z.undefined()]),
});
export type FetchDataHandlerRequestType = z.infer<typeof FetchDataHandlerRequestSchema>;

export type FetchDataHandlerResponseType = {
  readonly registeredUsers: string[];
  readonly userData: UserDataType | undefined;
  readonly verseData: VerseDataType | undefined;
};

export interface FetchDataHandlerInterface {
  (request: FetchDataHandlerRequestType): Promise<FetchDataHandlerResponseType>;
}
