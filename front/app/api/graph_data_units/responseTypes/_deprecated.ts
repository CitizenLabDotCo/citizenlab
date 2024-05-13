export type GenderOption = 'male' | 'female' | 'unspecified' | '_blank';

export type UsersByGenderResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      [key in GenderOption]: number;
    };
  };
};

export type UsersByAgeResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      [key: string]: number;
    };
  };
};
