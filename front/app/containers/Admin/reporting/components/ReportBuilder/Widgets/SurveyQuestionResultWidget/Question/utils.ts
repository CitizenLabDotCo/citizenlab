import { FormatMessage } from 'typings';

import { ResultGrouped } from 'api/survey_results/types';

import { Localize } from 'hooks/useLocalize';

import { EMPTY_COLOR } from 'components/admin/Graphs/SurveyBars/utils';
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

export const getLegendColors = (
  legend: (string | null)[],
  colorScheme: string[]
) => {
  return legend.map((key, i) => {
    if (key === null) {
      return EMPTY_COLOR;
    }
    return colorScheme[i % colorScheme.length];
  });
};
