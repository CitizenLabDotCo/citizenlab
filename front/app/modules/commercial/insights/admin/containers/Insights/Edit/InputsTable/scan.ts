import { BehaviorSubject } from 'rxjs';

type ScanCategory = {
  id: string;
  name: string;
  isScanning: boolean;
  initialCount: number;
};

const $scanCategory: BehaviorSubject<ScanCategory[]> = new BehaviorSubject([]);

export const scanCategoryStream = () => ({
  observable: $scanCategory,
});
