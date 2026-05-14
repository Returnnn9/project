import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'app', 'components', 'HeroSection.tsx');
  const content = await fs.readFile(filePath, 'utf-8');
  // return lines 35 to 80
  const lines = content.split('\n').slice(34, 80);
  return Response.json({ lines });
}
