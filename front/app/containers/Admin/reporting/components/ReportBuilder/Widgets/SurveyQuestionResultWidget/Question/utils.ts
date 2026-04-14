import { FormatMessage } from 'typings';

import { ResultGrouped } from 'api/survey_results/types';

import { Localize } from 'hooks/useLocalize';

import messages from 'components/admin/Graphs/SurveyBars/messages';

export const getLegendLabels = (
  attributes: ResultGrouped,
  localize: Localize,
  formatMessage: FormatMessage
) => {
  return attributes.legend.map((key) => {
    if (key === null) {
      return formatMessage(messages.noAnswer);
    }

    return localize(attributes.multilocs.group[key].title_multiloc);
  });
};
