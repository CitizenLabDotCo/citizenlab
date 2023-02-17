export type Keys<KeysObject extends Record<string, any>> = ReturnType<
  KeysObject[keyof KeysObject]
>;
