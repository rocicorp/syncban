import {
  type ShapeStream,
  type ChangeMessage,
  type Row,
  isChangeMessage,
} from "@electric-sql/client";

/**
 * Helper that returns a promise which resolves when a message is received from
 * the shape stream that matches the given operations and the match function.
 *
 * Useful to avoid removing optimistic results from the UI until the mutation
 * is represented in the shape stream.
 */
export async function matchStream<T extends Row<unknown>>({
  stream,
  operations,
  matchFn,
  timeout = 10000,
}: {
  stream: ShapeStream<T>;
  operations: Array<`insert` | `update` | `delete`>;
  matchFn: ({
    operationType,
    message,
  }: {
    operationType: string;
    message: ChangeMessage<T>;
  }) => boolean;
  timeout?: number;
}): Promise<ChangeMessage<T>> {
  return new Promise<ChangeMessage<T>>((resolve, reject) => {
    const unsubscribe = stream.subscribe((messages) => {
      const message = messages.filter(isChangeMessage).find(
        (message) =>
          operations.includes(message.headers.operation) &&
          matchFn({
            operationType: message.headers.operation,
            message: message,
          })
      );
      if (message) return finish(message);
    });

    const timeoutId = setTimeout(() => {
      console.error(`matchStream timed out after ${timeout}ms`);
      reject(`matchStream timed out after ${timeout}ms`);
    }, timeout);

    function finish(message: ChangeMessage<T>) {
      clearTimeout(timeoutId);
      unsubscribe();
      return resolve(message);
    }
  });
}
