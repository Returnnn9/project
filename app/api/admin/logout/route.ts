// DEPRECATED
export const runtime = "nodejs";

export async function POST() {
  return new Response("Deprecated", { status: 410 });
}
