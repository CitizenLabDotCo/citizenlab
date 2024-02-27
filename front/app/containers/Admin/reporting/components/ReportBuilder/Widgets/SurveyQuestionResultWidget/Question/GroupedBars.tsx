import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ProgressBars2 from 'components/admin/Graphs/ProgressBars2';

// i18n
import { useIntl } from 'utils/cl-intl';

// hooks
import useLocalize from 'hooks/useLocalize';

// typings
import { AttributesGrouped } from 'api/graph_data_units/responseTypes';
import messages from '../messages';

interface Props {
  attributes: AttributesGrouped;
  colorScheme: string[];
}

const GroupedBars = ({ attributes, colorScheme }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  return (
    <>
      {attributes.answers.map(({ answer, groups }, index) => {
        return (
          <Box
            key={index}
            maxWidth="524px"
            display="flex"
            alignItems="flex-end"
            justifyContent="center"
          >
            <ProgressBars2
              values={groups.map((group) => group.count)}
              total={attributes.totalPicks}
              colorScheme={colorScheme}
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

export default GroupedBars;
