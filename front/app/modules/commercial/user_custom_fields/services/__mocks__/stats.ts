import { BehaviorSubject } from 'rxjs';
import { IStreamParams } from 'utils/streams';
import { IUsersByRegistrationField } from '../stats';

let mockUsersByRegFieldsVariable: IUsersByRegistrationField | null = null;

export const __setMockUsersByRegFields = (data: IUsersByRegistrationField) => {
  mockUsersByRegFieldsVariable = data;
};

export const usersByRegFieldStream = jest.fn((_streamParams: IStreamParams, _regFieldId) => {
  const observable = new BehaviorSubject(mockUsersByRegFieldsVariable);
  return {
    observable
  };
});

export const mockUsersByRegFields = {
  series: {
    users: {
      active_politician: 1,
      no: 7,
      retired_politician: 2,
      _blank: 11
    }
  },
  options: {
    active_politician: {
      title_multiloc: {
        en: 'Active politician'
      }
    },
    retired_politician: {
      title_multiloc: {
        en: 'Retired politician'
      }
    },
    no: {
      title_multiloc: {
        en: 'No'
      }
    }
  }
} as IUsersByRegistrationField;
