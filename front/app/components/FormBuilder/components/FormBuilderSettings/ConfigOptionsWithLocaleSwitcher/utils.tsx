import messages from './messages';

export type ListType = 'statement' | 'default';

export const getFieldLabelText = (listType: ListType) => {
  switch (listType) {
    case 'statement':
      return messages.fieldLabelStatement;
    default:
      return messages.fieldLabel;
  }
};

export const getAddButtonText = (listType: ListType) => {
  switch (listType) {
    case 'statement':
      return messages.addStatement;
    default:
      return messages.addAnswer;
  }
};
