import { Controller, JoinStreamParams } from "@/lib/controller";

// TODO: validate request with Zod

export async function POST(req: Request) {
  const controller = new Controller();

  try {
    const reqBody = await req.json();
    const decodedBody = {
      identity: reqBody.identity,
      room_name: decodeURIComponent(reqBody.room_name),
    };
    const response = await controller.joinStream(decodedBody as JoinStreamParams);

    return Response.json(response);
  } catch (err) {
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(null, { status: 500 });
  }
}
