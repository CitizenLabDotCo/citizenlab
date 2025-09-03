import messages from '../../messages';

type GetTextResponseTitleParams = {
  hasOtherResponses?: boolean;
  hasFollowUpResponses?: boolean;
};

export const getTextResponseTitle = ({
  hasOtherResponses,
  hasFollowUpResponses,
}: GetTextResponseTitleParams) => {
  if (hasOtherResponses) {
    return messages.otherResponses;
  }
  if (hasFollowUpResponses) {
    return messages.followUpResponses;
  }
  return messages.allResponses;
};
