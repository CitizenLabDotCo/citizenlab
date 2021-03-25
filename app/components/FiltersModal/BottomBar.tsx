import React, { memo, FormEvent } from 'react';

// components
import Button from 'components/UI/Button';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.div`
  height: ${(props) => props.theme.mobileTopBarHeight}px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fff;
  border-top: solid 1px ${lighten(0.4, colors.label)};
`;

interface Props {
  buttonText: string | JSX.Element;
  onClick: (event: FormEvent) => void;
  className?: string;
}

const BottomBar = memo<Props>(({ buttonText, onClick, className }) => {
  return (
    <Container className={className}>
      <Button onClick={onClick} fullWidth={true}>
        {buttonText}
      </Button>
    </Container>
  );
});

export default BottomBar;
