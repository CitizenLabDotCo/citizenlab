import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { AttributesUngrouped } from 'api/graph_data_units/responseTypes';

import useLocalize from 'hooks/useLocalize';

import ProgressBars2 from 'components/admin/Graphs/ProgressBars2';
import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  attributes: AttributesUngrouped;
}

const COLOR_SCHEME = [DEFAULT_CATEGORICAL_COLORS[0]];

const UngroupedBars = ({ attributes }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  return (
    <Box className="e2e-survey-question-ungrouped-bars">
      {attributes.answers.map(({ answer, count }, index) => {
        return (
          <Box
            key={index}
            maxWidth="524px"
            display="flex"
            alignItems="flex-end"
            justifyContent="center"
          >
            <ProgressBars2
              values={[count]}
              total={attributes.totalPickCount}
              colorScheme={COLOR_SCHEME}
              label={
                answer === null
                  ? formatMessage(messages.noAnswer)
                  : localize(attributes.multilocs.answer[answer].title_multiloc)
              }
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default UngroupedBars;
