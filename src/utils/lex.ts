export function compare(
  a: string | number | boolean,
  b: string | number | boolean
): number {
  if (a === b) return 0;
  if (a < b) return -1;
  return 1;
}

export function compareOrdered(a: any, b: any) {
  return compare(a.order, b.order);
}
