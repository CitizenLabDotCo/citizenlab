import React from 'react';

import { Box, Image } from '@citizenlab/cl2-component-library';

import { AttributesGrouped } from 'api/graph_data_units/responseTypes';

import useLocalize from 'hooks/useLocalize';

import ProgressBars2 from 'components/admin/Graphs/ProgressBars2';
import messages from 'components/admin/Graphs/SurveyBars/messages';

import { useIntl } from 'utils/cl-intl';

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
        const image = answer
          ? attributes.multilocs.answer[answer].image
          : undefined;
        const label =
          answer === null
            ? formatMessage(messages.noAnswer)
            : localize(attributes.multilocs.answer[answer].title_multiloc);

        return (
          <Box
            key={index}
            maxWidth="524px"
            display="flex"
            alignItems="flex-end"
            justifyContent="center"
          >
            {image?.small && (
              <Box mr="12px">
                <Image
                  width="48px"
                  height="48px"
                  src={image.small}
                  alt={label}
                />
              </Box>
            )}
            <ProgressBars2
              values={groups.map((group) => group.count)}
              total={attributes.totalPickCount}
              colorScheme={colorScheme}
              label={label}
            />
          </Box>
        );
      })}
    </>
  );
};

export default GroupedBars;
