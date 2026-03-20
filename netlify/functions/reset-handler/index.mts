import { ResetHandlerType } from '../../../src/types/reset-handler.types';

/**
 * Handler for resetting all data in the pool. For security reasons, it has to be called by an existing user. Returns nothing.
 *
 * @param userId The ID of the user to be reset
 */

const handler: ResetHandlerType = async (userId) => {
  throw new Error('Not implemented');
};

export default handler;
