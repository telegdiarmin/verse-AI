import { RegisterUserHandlerType } from '../../../src/types/register-user-handler.types';

/**
 * Handler for registering a new user to the pool. Returns a unique user ID and the name of the registered user.
 *
 * @param name The name of the user to be registered
 */

const handler: RegisterUserHandlerType = async (name) => {
  throw new Error('Not implemented');
};

export default handler;
