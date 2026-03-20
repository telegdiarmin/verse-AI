import { UUID } from './uuid.types';

export type ResetHandlerType = (userId: UUID) => Promise<void>;
