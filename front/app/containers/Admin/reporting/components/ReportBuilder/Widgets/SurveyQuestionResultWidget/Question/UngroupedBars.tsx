import React from 'react';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import ProgressBars2 from 'components/admin/Graphs/ProgressBars2';

// i18n
import { useIntl } from 'utils/cl-intl';

// hooks
import useLocalize from 'hooks/useLocalize';

// typings
import { AttributesUngrouped } from 'api/graph_data_units/responseTypes';
import messages from '../messages';

interface Props {
  attributes: AttributesUngrouped;
}

const COLOR_SCHEME = [colors.primary];

const UngroupedBars = ({ attributes }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  return (
    <>
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
              total={attributes.totalPicks}
              colorScheme={COLOR_SCHEME}
              label={
                answer === null
                  ? formatMessage(messages.noAnswer)
                  : localize(attributes.multilocs.answer[answer])
              }
            />
          </Box>
        );
      })}
    </>
  );
};

export default UngroupedBars;
