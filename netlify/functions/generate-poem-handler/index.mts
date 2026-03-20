import { GeneratePoemHandlerType } from '../../../src/types/generate-poem-handler.types';

/**
 * Handler for generating a poem for the pool with an amount of verses equal to the amount of users in the pool. Returns the verse entitled to the user with the given ID.
 *
 * @param userId The ID of the user requesting the poem
 */

const handler: GeneratePoemHandlerType = async (userId) => {
  throw new Error('Not implemented');
};

export default handler;
