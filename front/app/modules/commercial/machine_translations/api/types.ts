import { IRelationship, SupportedLocale } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import machineTranslationKeys from './keys';

export type MachineTranslationKeys = Keys<typeof machineTranslationKeys>;

type AttributeName = 'title_multiloc' | 'body_multiloc';

export interface IMachineTranslationData {
  id: string;
  type: string;
  attributes: {
    attribute_name: AttributeName;
    locale_to: SupportedLocale;
    translation: string;
  };
  relationships: {
    translatable: {
      data: IRelationship;
    };
  };
}

export interface IMachineTranslation {
  data: IMachineTranslationData;
}

type IMachineTranslationAttributes = {
  locale_to?: SupportedLocale;
  attribute_name: AttributeName;
};

export interface IMachineTranslationParams {
  ideaId?: string;
  commentId?: string;
  machine_translation: IMachineTranslationAttributes;
}

export interface IMachineTranslationByCommentIdParams
  extends Omit<IMachineTranslationParams, 'ideaId'> {
  commentId: string;
}

export interface IMachineTranslationByIdeaIdParams
  extends Omit<IMachineTranslationParams, 'commentId'> {
  ideaId: string;
}
