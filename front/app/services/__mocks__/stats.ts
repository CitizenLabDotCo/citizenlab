import { BehaviorSubject } from 'rxjs';
import { IUsersByRegistrationField, IUsersByTime, IIdeasCount } from 'services/stats';
import { IStreamParams } from 'utils/streams';

export const usersByRegFieldXlsxEndpoint = (customFieldId: string) =>
  `testendpoint/users_by_custom_field_as_xlsx/${customFieldId}`;

let mockIdeasCount: IIdeasCount | null = null;

export const __setMockIdeasCount = (ideasCount: IIdeasCount) => {
  mockIdeasCount = ideasCount;
};

export const ideasCount = jest.fn((_ideasCount) => {
  const observable = new BehaviorSubject(mockIdeasCount);
  return {
    observable
  };
});

// usersByRegFieldStream
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

// usersByTimeCumulativeStream
let mockUsersByTimeCumulativeStreamVariable: IUsersByTime | null = null;

export const __setMockUsersByTimeCumulativeStream = (data: IUsersByTime) => {
  mockUsersByTimeCumulativeStreamVariable = data;
};

export const usersByTimeCumulativeStream = jest.fn((_streamParams: IStreamParams) => {
  const observable = new BehaviorSubject(mockUsersByTimeCumulativeStreamVariable);
  return {
    observable
  };
});

export const mockUsersByTimeCumulative = {
  series: {
    users: {
      '2018-11-01': 1,
      '2018-11-02': 1,
      '2018-11-03': 1,
      '2018-11-04': 1,
      '2018-11-05': 1,
      '2018-11-06': 1,
      '2018-11-07': 1,
      '2018-11-08': 1,
      '2018-11-09': 1,
      '2018-11-10': 1,
      '2018-11-11': 6,
      '2018-11-12': 6,
      '2018-11-13': 6,
      '2018-11-14': 6,
      '2018-11-15': 6,
      '2018-11-16': 6,
      '2018-11-17': 6,
      '2018-11-18': 6,
      '2018-11-19': 6,
      '2018-11-20': 6,
      '2018-11-21': 6,
      '2018-11-22': 6,
      '2018-11-23': 6,
      '2018-11-24': 6,
      '2018-11-25': 6,
      '2018-11-26': 10,
      '2018-11-27': 10,
      '2018-11-28': 10,
      '2018-11-29': 10,
      '2018-11-30': 10
    }
  }
};
