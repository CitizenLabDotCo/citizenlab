export type Keys<KeysObject extends Record<string, any>> = ReturnType<
  KeysObject[keyof KeysObject]
>;

interface ItemKeyDefinition {
  type: string;
  variant?: never;
}

interface BaseKeyDefinition {
  type: string;
  variant?: string;
}

export interface QueryKeys {
  all: () => [BaseKeyDefinition];
  lists?: () => [BaseKeyDefinition & { operation: 'list' }];
  list?: (
    parameters: Record<string, any>
  ) => [
    BaseKeyDefinition & { operation: 'list'; parameters: Record<string, any> }
  ];
  items?: () => [BaseKeyDefinition & { operation: 'item' }];
  item?: (
    parameters: Record<string, any>
  ) => [
    ItemKeyDefinition & { operation: 'item'; parameters: Record<string, any> }
  ];
}
