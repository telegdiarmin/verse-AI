import { UUID } from './uuid.types';

export type RegisterUserHandlerResponseType = {
  name: string;
  userId: UUID;
};

export type RegisterUserHandlerType = (name: string) => Promise<RegisterUserHandlerResponseType>;
