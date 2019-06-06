import React, { memo, useCallback } from 'react';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import eventEmitter from 'utils/eventEmitter';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  height: ${props => props.theme.mobileTopBarHeight}px;
  background: #fff;
  border-top: solid 1px ${colors.separation};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: 40px;
  padding-bottom: 40px;
`;

interface Props {
  className?: string;
}

const BottomBar = memo<Props>(({ className }) => {

  const onApplyFilters = useCallback(() => {
    eventEmitter.emit('IdeaFiltersBottomBar', 'applyIdeaFilters', null);
  }, []);

  return (
    <Container className={className}>
      <Button onClick={onApplyFilters} fullWidth={true}>
      <FormattedMessage {...messages.showIdeas} />
      </Button>
    </Container>
  );
});

export default BottomBar;
