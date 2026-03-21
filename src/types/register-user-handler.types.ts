import { UserDataType } from './user-data.types';

export type RegisterUserHandlerResponseType = {
  readonly userData: UserDataType;
};

export interface RegisterUserHandlerInterface {
  (name: string): Promise<RegisterUserHandlerResponseType>;
}
