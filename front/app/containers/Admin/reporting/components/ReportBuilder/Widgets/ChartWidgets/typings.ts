import { Multiloc } from 'typings';

export interface ChartWidgetProps {
  title?: Multiloc;
  projectId: string | undefined;
  startAt?: string;
  endAt?: string | null;
}
