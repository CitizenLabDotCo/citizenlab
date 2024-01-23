import { GenderOption } from 'api/users_by_gender/types';

export type UsersByGenderResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      [key in GenderOption]: number;
    };
  };
};

export type UsersByBirthyearResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      [key: string]: number;
    };
  };
};
