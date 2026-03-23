import { z } from 'zod';

import { UserDataType } from './user-data.types';

const UserName = z.string().min(3, 'Name must be at least 3 characters long').trim();
export type UserNameType = z.infer<typeof UserName>;

export const RegisterUserHandlerRequestSchema = z.object({
  name: UserName,
});
export type RegisterUserHandlerRequestType = z.infer<typeof RegisterUserHandlerRequestSchema>;

export type RegisterUserHandlerResponseType = {
  readonly userData: UserDataType;
};

export interface RegisterUserHandlerInterface {
  (request: RegisterUserHandlerRequestType): Promise<RegisterUserHandlerResponseType>;
}
