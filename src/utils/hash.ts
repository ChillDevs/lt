import bcrypt from "bcrypt";

export const hash = async (text: string) => {
  const saltRounds = 10;
  return bcrypt.hash(text, saltRounds);
};

export const compare = async (text: string, hashStr: string) => {
  return bcrypt.compare(text, hashStr);
};