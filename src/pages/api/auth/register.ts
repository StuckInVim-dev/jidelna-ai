import { query } from '@/lib/db';
import { hashPassword, generateToken, comparePasswords, verifyToken } from '@/lib/auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const userCheck = await query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userCheck.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const result = await query(
      'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );

    res.status(201).json({ success: true, userId: result.rows[0].id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}