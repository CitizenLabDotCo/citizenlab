// The tool handles more resources, but the assistant only lets the model remove these.
export type DestroyResourceArguments = {
  resource_type: 'phase' | 'event';
  id: string;
};
