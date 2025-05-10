import {
  Controller,
  type RemoveFromStageParams,
  getSessionFromReq,
} from "@/lib/controller";

// TODO: validate request with Zod

export async function POST(req: Request) {
  const controller = new Controller();

  try {
    const session = getSessionFromReq(req);
    const reqBody = (await req.json()) as RemoveFromStageParams;
    await controller.removeFromStage(session, reqBody);

    return Response.json({});
  } catch (err) {
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(null, { status: 500 });
  }
}
