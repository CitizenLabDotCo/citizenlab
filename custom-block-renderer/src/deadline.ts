export class DeadlineExceeded extends Error {}

/**
 * Settles like `work`, or rejects with DeadlineExceeded once `ms` have passed.
 *
 * The work itself is not stopped: a page stuck in a loop keeps running it. The
 * caller has to throw away whatever is doing the work.
 */
export const withDeadline = <T>(
  work: Promise<T>,
  ms: number,
  message: string
): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new DeadlineExceeded(message)), ms);
  });

  return Promise.race([work, deadline]).finally(() => clearTimeout(timer));
};
