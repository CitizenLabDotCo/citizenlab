import { BehaviorSubject } from 'rxjs';
import { IArea } from 'services/areas';

let mockArea: IArea | null = null;

export const __setMockArea = (area: IArea) => {
  mockArea = area;
};

export const areaByIdStream = jest.fn((_areaId) => {
  const observable = new BehaviorSubject(mockArea);
  return {
    observable,
  };
});
