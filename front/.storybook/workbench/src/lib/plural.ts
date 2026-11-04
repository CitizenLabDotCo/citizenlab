// "1 page", "2 pages".
export const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;
