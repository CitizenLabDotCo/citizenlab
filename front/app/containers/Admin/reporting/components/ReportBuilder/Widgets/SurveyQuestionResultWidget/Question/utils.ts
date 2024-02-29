import moment from 'moment';

// styling
import { colors } from '@citizenlab/cl2-component-library';
import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';

// i18n
import messages from '../messages';

// typings
import { FormatMessage } from 'typings';
import { IPhaseData } from 'api/phases/types';
import { AttributesGrouped } from 'api/graph_data_units/responseTypes';
import { Localize } from 'hooks/useLocalize';

export const generateDateRange = (
  formatMessage: FormatMessage,
  startAt: string,
  endAt: string | null
) => {
  const startAtMoment = moment(startAt);

  if (!endAt) {
    return formatMessage(messages.untilNow, {
      date: startAtMoment.format('DD MMM YYYY'),
    });
  }

  const endAtMoment = moment(endAt);

  const sameYear = startAtMoment.year() === endAtMoment.year();
  const sameMonth = sameYear && startAtMoment.month() === endAtMoment.month();

  if (sameMonth) {
    return `${startAtMoment.format('DD')} - ${endAtMoment.format(
      'DD MMM YYYY'
    )}`;
  }

  if (sameYear) {
    return `${startAtMoment.format('DD MMM')} - ${endAtMoment.format(
      'DD MMM YYYY'
    )}`;
  }

  return `${startAtMoment.format('DD MMM YYYY')} - ${endAtMoment.format(
    'DD MMM YYYY'
  )}`;
};

export const getPhaseIndex = (phases: IPhaseData[], phaseId: string) => {
  return phases.findIndex((phase) => phase.id === phaseId);
};

const EMPTY_COLOR = colors.coolGrey300;

export const getColorScheme = (length: number) => {
  return [...DEFAULT_CATEGORICAL_COLORS.slice(0, length - 1), EMPTY_COLOR];
};

export const getLegendLabels = (
  attributes: AttributesGrouped,
  localize: Localize,
  formatMessage: FormatMessage
) => {
  return attributes.legend.map((key) => {
    if (key === null) {
      return formatMessage(messages.noAnswer);
    }

    return localize(attributes.multilocs.group[key]);
  });
};
