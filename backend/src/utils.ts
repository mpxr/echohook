import { Env, WebhooksStorageRPC } from "./types.js";

export function getDurableObject(
  env: Env
): DurableObjectStub & WebhooksStorageRPC {
  const id = env.WEBHOOKS.idFromName("webhooks");
  return env.WEBHOOKS.get(id) as DurableObjectStub & WebhooksStorageRPC;
}
