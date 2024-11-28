import React, { memo, FormEvent } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import styled from 'styled-components';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import { Props as InputFiltersProps } from 'components/IdeaCards/IdeasWithFiltersSidebar/InputFilters';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const Container = styled.div`
  height: ${(props) => props.theme.mobileTopBarHeight}px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fff;
  border-top: solid 1px ${lighten(0.4, colors.textSecondary)};
`;

interface Props {
  onClick: (event: FormEvent) => void;
  className?: string;
  selectedIdeaFilters: InputFiltersProps['selectedIdeaFilters'];
}

const BottomBar = memo<Props>(({ onClick, className, selectedIdeaFilters }) => {
  const { data: ideasFilterCounts } = useIdeasFilterCounts(selectedIdeaFilters);

  if (!ideasFilterCounts) return null;

  return (
    <Container className={className}>
      <Button onClick={onClick} fullWidth={true}>
        <FormattedMessage
          {...messages.showXResults}
          values={{
            ideasCount: ideasFilterCounts.data.attributes.total,
          }}
        />
      </Button>
    </Container>
  );
});

export default BottomBar;
