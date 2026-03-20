import { UUID } from './uuid.types';

export type FetchVerseHandlerType = (userId: UUID) => Promise<string>;
