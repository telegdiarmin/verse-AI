import z from 'zod';

export const ResetHandlerRequestSchema = z.object({
  userId: z.uuid(),
});
export type ResetHandlerRequestType = z.infer<typeof ResetHandlerRequestSchema>;

export interface ResetHandlerInterface {
  (request: ResetHandlerRequestType): Promise<void>;
}
