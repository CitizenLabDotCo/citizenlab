import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { AttributesGrouped } from 'api/graph_data_units/responseTypes';

import useLocalize from 'hooks/useLocalize';

import ProgressBars2 from 'components/admin/Graphs/ProgressBars2';

import { useIntl } from 'utils/cl-intl';

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
              total={attributes.totalPickCount}
              colorScheme={colorScheme}
              label={
                answer === null
                  ? formatMessage(messages.noAnswer)
                  : localize(attributes.multilocs.answer[answer].title_multiloc)
              }
            />
          </Box>
        );
      })}
    </>
  );
};

export default GroupedBars;
