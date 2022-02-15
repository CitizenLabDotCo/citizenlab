import React, { MouseEvent } from 'react';

// components
import CloseIconButton from 'components/UI/CloseIconButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.div`
  height: ${(props) => props.theme.mobileTopBarHeight}px;
  background: #fff;
  border-bottom: solid 1px ${lighten(0.4, colors.label)};
`;

const StyledCloseIconButton = styled(CloseIconButton)`
  padding: 20px;
`;

const StyledButton = styled.button`
  cursor: pointer;
`;

const TopBarInner = styled.div`
  height: 100%;
  padding-left: 15px;
  padding-right: 15px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.biggerThanMinTablet`
    padding-left: 30px;
    padding-right: 30px;
  `}
`;

const Left = styled.div`
  height: 48px;
  align-items: center;
  display: flex;
`;

const Center = styled.h1`
  flex: 1;
  font-size: ${fontSizes.medium}px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
`;

const Right = styled.div``;

interface Props {
  onClose: () => void;
  onReset: (event: MouseEvent) => void;
  className?: string;
}

const TopBar = ({ onClose, onReset, className }: Props) => {
  return (
    <Container className={className}>
      <TopBarInner>
        <Left>
          <StyledCloseIconButton
            a11y_buttonActionMessage={messages.a11y_closeFilterPanel}
            onClick={onClose}
            iconColor={colors.label}
            iconColorOnHover={'#000'}
            iconWidthInPx={15}
            heightInPx={15}
          />
        </Left>
        <Center>
          <FormattedMessage {...messages.filters} />
        </Center>
        <Right>
          <StyledButton onClick={onReset}>
            <FormattedMessage {...messages.resetFilters} />
          </StyledButton>
        </Right>
      </TopBarInner>
    </Container>
  );
};

export default TopBar;
