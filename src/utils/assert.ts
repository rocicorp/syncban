export function assert(cond: unknown, msg?: string | undefined): asserts cond {
  if (!msg) {
    msg = "Assertion failed";
  }
  if (!cond) {
    throw new Error(msg);
  }
}

export function must<T>(
  thing: T | null | undefined,
  msg?: string | undefined
): T {
  assert(thing, msg);
  return thing;
}
