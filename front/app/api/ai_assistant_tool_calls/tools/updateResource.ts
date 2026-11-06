import { CreateEventArguments } from './createEvent';

// The tool handles more resources, but the assistant only lets the model update events.
export type UpdateResourceArguments = {
  type: 'event';
  id: string;
  attributes: Partial<CreateEventArguments>;
};
