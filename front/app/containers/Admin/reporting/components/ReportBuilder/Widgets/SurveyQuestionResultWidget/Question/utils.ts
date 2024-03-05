// styling
import { colors } from '@citizenlab/cl2-component-library';
import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';

// i18n
import messages from '../messages';

// typings
import { FormatMessage } from 'typings';
import { AttributesGrouped } from 'api/graph_data_units/responseTypes';
import { Localize } from 'hooks/useLocalize';

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
