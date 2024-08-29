import { IIdeaImageData } from 'api/idea_images/types';
import { IIdeaData } from 'api/ideas/types';

export type SingleIdeaResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      idea: IIdeaData;
      idea_images: IIdeaImageData[];
    };
  };
};
