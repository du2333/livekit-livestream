"use server";

import { Controller } from "@/lib/controller";

export async function listRooms() {
  const controller = new Controller();
  const rooms = await controller.listActiveStreams();
  return rooms;
}
