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
      title_multiloc: {
        en: 'Active politician',
      },
    },
    retired_politician: {
      title_multiloc: {
        en: 'Retired politician',
      },
    },
    no: {
      title_multiloc: {
        en: 'No',
      },
    },
  },
} as IUsersByRegistrationField;
