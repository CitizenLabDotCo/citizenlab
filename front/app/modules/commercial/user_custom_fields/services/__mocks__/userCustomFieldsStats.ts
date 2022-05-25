import { IUsersByRegistrationField } from '../stats';

export const mockUsersByRegFields = {
  series: {
    users: {
      active_politician: 1,
      no: 7,
      retired_politician: 2,
      _blank: 11,
    },
  },
  options: {
    active_politician: {
      ordering: 1,
      title_multiloc: {
        en: 'Active politician',
      },
    },
    retired_politician: {
      ordering: 2,
      title_multiloc: {
        en: 'Retired politician',
      },
    },
    no: {
      ordering: 3,
      title_multiloc: {
        en: 'No',
      },
    },
  },
} as IUsersByRegistrationField;
