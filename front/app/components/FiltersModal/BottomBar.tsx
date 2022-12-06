import React, { memo, FormEvent } from 'react';
import { lighten } from 'polished';
import { colors } from 'utils/styleUtils';
// components
import Button from 'components/UI/Button';
// styling
import styled from 'styled-components';

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
