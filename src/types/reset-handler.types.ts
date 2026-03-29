export interface ResetHandlerInterface {
  (userId: string): Promise<void>;
}
