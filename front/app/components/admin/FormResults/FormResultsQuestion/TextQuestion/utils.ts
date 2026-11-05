import messages from '../../messages';

// The source of the free-text responses shown in a TextResponses block (and
// summarised by the adjacent AI box):
// - 'other_option': the free text typed into a select/multiselect "other" option
// - 'follow_up': the follow-up text asked after a sentiment scale question
// - 'free_text': a plain open-text question
export type TextResponseSource = 'other_option' | 'follow_up' | 'free_text';

type GetTextResponseTitleParams = {
  textResponseSource?: TextResponseSource;
};

export const getTextResponseTitle = ({
  textResponseSource,
}: GetTextResponseTitleParams) => {
  switch (textResponseSource) {
    case 'other_option':
      return messages.otherResponses;
    case 'follow_up':
      return messages.followUpResponses;
    default:
      return messages.allResponses;
  }
};
