import { BehaviorSubject } from 'rxjs';
import { IIdea } from 'services/ideas';

let mockIdea: IIdea | null = null;

export const __setMockIdea = (idea: IIdea) => {
  mockIdea = idea;
};

export const areaByIdStream = jest.fn((_areaId) => {
  const observable = new BehaviorSubject(mockIdea);
  return {
    observable
  };
});
