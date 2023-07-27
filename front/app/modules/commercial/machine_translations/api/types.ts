import { Keys } from 'utils/cl-react-query/types';
import { IRelationship, Locale } from 'typings';
import machineTranslationKeys from './keys';

export type MachineTranslationKeys = Keys<typeof machineTranslationKeys>;

type AttributeName = 'title_multiloc' | 'body_multiloc';

export interface IMachineTranslationData {
  id: string;
  type: string;
  attributes: {
    attribute_name: AttributeName;
    locale_to: Locale;
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
  locale_to?: Locale;
  attribute_name: AttributeName;
};

export interface IMachineTranslationParams {
  ideaId?: string;
  commentId?: string;
  initiativeId?: string;
  machine_translation: IMachineTranslationAttributes;
}

export interface IMachineTranslationByCommentIdParams
  extends Omit<IMachineTranslationParams, 'ideaId' | 'initiativeId'> {
  commentId: string;
}

export interface IMachineTranslationByIdeaIdParams
  extends Omit<IMachineTranslationParams, 'commentId' | 'initiativeId'> {
  ideaId: string;
}

export interface IMachineTranslationByInitiativeIdParams
  extends Omit<IMachineTranslationParams, 'commentId' | 'ideaId'> {
  initiativeId: string;
}
