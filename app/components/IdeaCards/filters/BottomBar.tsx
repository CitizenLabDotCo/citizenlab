import React, { memo, useCallback } from 'react';

// components
import Button from 'components/UI/Button';

// i18n
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from './messages';

// utils
import eventEmitter from 'utils/eventEmitter';

// styling
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.div`
  height: ${props => props.theme.mobileTopBarHeight}px;
  background: #fff;
  border-top: solid 1px ${colors.separation};

  /* ${media.biggerThanMaxTablet`
    display: none;
  `} */
`;

interface Props {
  className?: string;
}

const IdeaFiltersBottomBar = memo<Props>(({ className }) => {

  const onApplyFilters = useCallback(() => {
    eventEmitter.emit('IdeaFiltersBottomBar', 'applyIdeaFilters', null);
  }, []);

  return (
    <Container className={className}>
      <Button onClick={onApplyFilters}>
        Apply filters
      </Button>
    </Container>
  );
});

export default IdeaFiltersBottomBar;
