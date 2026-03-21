import { FetchDataHandlerInterface } from '../../../src/types/fetch-data-handler.types';

/**
 * Handler for fetching a verse for a user. Returns the verse entitled to the user with the given ID.
 *
 * @param userId The ID of the user requesting the verse
 */

const handler: FetchDataHandlerInterface = async (userId) => {
  throw new Error('Not implemented');
};

export default handler;
