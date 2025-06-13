import React, { FormEvent } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import { InputFiltersProps } from '../../InputFilters';
import ResetFiltersButton from '../../ResetFiltersButton';

import messages from './messages';

interface Props {
  onClick: (event: FormEvent) => void;
  ideaQueryParameters: InputFiltersProps['ideaQueryParameters'];
}

const BottomBar = ({ onClick, ideaQueryParameters }: Props) => {
  const { data: ideasFilterCounts } = useIdeasFilterCounts(ideaQueryParameters);

  if (!ideasFilterCounts) return null;

  return (
    <Box
      background={colors.white}
      p="16px"
      pb="0"
      flex="1"
      borderTop={`1px solid ${colors.grey300}`}
    >
      <ButtonWithLink onClick={onClick} fullWidth={true}>
        <FormattedMessage
          {...messages.showXResults}
          values={{
            ideasCount: ideasFilterCounts.data.attributes.total,
          }}
        />
      </ButtonWithLink>
      <ResetFiltersButton ideaQueryParameters={ideaQueryParameters} />
    </Box>
  );
};
export default BottomBar;
