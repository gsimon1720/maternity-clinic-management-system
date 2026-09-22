import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (plainPassword, storedHash) => {
  if (!storedHash) return false;

  if (storedHash.startsWith('$2')) {
    return bcrypt.compare(plainPassword, storedHash);
  }

  return plainPassword === storedHash;
};
