import { UUID } from './uuid.types';

export interface ResetHandlerInterface {
  (userId: UUID): Promise<void>;
}
