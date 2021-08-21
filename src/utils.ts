import { Key, PaginatePayload } from './crudAction';

export const defaultIdGenerator = (() => {
  let count = 0;
  return function defaultIdGenerator() {
    count++;
    return `mock-${count}`;
  };
})();

export function createPlaceholder<I, K extends Key<I>>(
  key: K,
  length: number,
  idGenerator: (idx: number) => string = defaultIdGenerator
) {
  return {
    ids: Array.from({ length }, (_, index) => idGenerator(index)),
    list: Array.from(
      { length },
      (_, index) => ({ [key]: idGenerator(index) } as unknown as Partial<I>)
    )
  };
}

export function parsePaginatePayload<I>(payload: PaginatePayload<I>) {
  return Array.isArray(payload)
    ? {
        total: payload.length,
        data: payload,
        pageNo: 1
      }
    : payload;
}

export const createInsert =
  (from: number, to: number) =>
  <T1, T2>(arr: T1[], ids: T2[]) => {
    return [...arr.slice(0, from), ...ids, ...arr.slice(to)];
  };

export function removeFromArray<T>(arr: T[], index: number) {
  return index < 0 ? arr : [...arr.slice(0, index), ...arr.slice(index + 1)];
}

export function equals(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object'))
    return a === b;
  if (a.prototype !== b.prototype) return false;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every(k => equals(a[k], b[k]));
}
