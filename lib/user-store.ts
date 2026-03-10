import fs from "fs/promises";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

export interface UserData {
 id: string;
 name: string;
 email: string;
 passwordHash: string;
 role: string;
 createdAt: string;
}

export async function getUsers(): Promise<UserData[]> {
 try {
  const data = await fs.readFile(USERS_FILE, "utf-8");
  return JSON.parse(data);
 } catch {
  return [];
 }
}

export async function saveUsers(users: UserData[]) {
 const dir = path.dirname(USERS_FILE);
 try {
  await fs.access(dir);
 } catch {
  await fs.mkdir(dir, { recursive: true });
 }
 await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function findUserByEmail(email: string) {
 const users = await getUsers();
 return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(data: Omit<UserData, 'id' | 'createdAt'>) {
 const users = await getUsers();
 const newUser: UserData = {
  ...data,
  id: `local-${Date.now()}`,
  createdAt: new Date().toISOString()
 };
 await saveUsers([...users, newUser]);
 return newUser;
}
