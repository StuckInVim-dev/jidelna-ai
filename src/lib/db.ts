const { Pool } = require("pg");

const pool = new Pool({
	user: "user",
	host: "postgres",
	database: "jidelna_ai",
	password: "password",
	port: 5432,
});

export const query = (text: string, params?: any) => pool.query(text, params);

export async function updateUserField(
	userId: string,
	fieldName: string,
	fieldValue: any
): Promise<any> {
	const text = `UPDATE users SET ${fieldName} = $1 WHERE id = $2 RETURNING *`;
	const params = [fieldValue, userId];
	return query(text, params)
		.then((res: any) => res.rows[0])
		.catch((err: Error) => {
			console.error("Error updating user field:", err);
			throw err;
		});
}

export async function getUserField(userId: string, fieldName: string): Promise<any> {
    const text = `SELECT ${fieldName} FROM users WHERE id = $1`;
    const params = [userId];
    return query(text, params)
      .then((res: any) => res.rows[0][fieldName])
      .catch((err: Error) => {
        console.error('Error retrieving user field:', err);
        throw err;
      });
  }