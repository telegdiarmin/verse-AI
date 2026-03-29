import type { Client } from 'pg';
import type { UserDataType } from '../../../src/types/user-data.types';

export const getUsers = async (client: Client): Promise<UserDataType[]> => {
  const usersResult = await client.query(/* sql */
  `
    SELECT
      id,
      name
    FROM
      users;
  `);

  const users: UserDataType[] = usersResult.rows.map((row) => ({
    userId: row.id,
    name: row.name,
  }));

  return users;
};
