import { MessageDescriptor } from 'utils/cl-intl';

export interface SelectedNode {
  id: string;
  name: string;
  title: MessageDescriptor | undefined;
  settings: React.ElementType<any> | undefined;
  isDeletable: boolean;
  custom?: Record<string, any>;
}
