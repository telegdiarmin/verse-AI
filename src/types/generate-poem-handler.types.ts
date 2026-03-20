import { UUID } from './uuid.types';

export type GeneratePoemHandlerType = (userId: UUID) => Promise<string>;
