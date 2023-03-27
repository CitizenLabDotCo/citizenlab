export type Keys<KeysObject extends Record<string, any>> = ReturnType<
  KeysObject[keyof KeysObject]
>;

interface KeyDefinition {
  type: string;
  operation?: 'list' | 'item';
  variant?: string;
  parameters?: Record<string, any>;
}

export interface QueryKeys {
  all: () => KeyDefinition[];
  lists?: (parameters?: Record<string, any>) => [KeyDefinition];
  list?: (parameters?: Record<string, any>) => [KeyDefinition];
  items?: (parameters?: Record<string, any>) => [KeyDefinition];
  item?: (parameters?: Record<string, any>) => [KeyDefinition];
}
