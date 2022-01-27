import React, { MouseEvent } from 'react';

// components
import { Icon } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div`
  height: ${(props) => props.theme.mobileTopBarHeight}px;
  background: #fff;
  border-bottom: solid 1px ${lighten(0.4, colors.label)};
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

const CloseIcon = styled(Icon)`
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  fill: ${colors.label};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: fill 100ms ease-out;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  margin-right: 6px;
  margin-left: -2px;
  cursor: pointer;
  transition: all 100ms ease-out;

  &:hover {
    border-color: #000;

    ${CloseIcon} {
      fill: #000;
    }
  }
`;

interface Props {
  onClose: (event: MouseEvent) => void;
  onReset: (event: MouseEvent) => void;
  className?: string;
}

const TopBar = ({ onClose, onReset, className }: Props) => {
  return (
    <Container className={className}>
      <TopBarInner>
        <Left>
          <CloseButton onClick={onClose}>
            <CloseIcon name="close" />
            <ScreenReaderOnly>
              <FormattedMessage {...messages.a11y_closeFilterPanel} />
            </ScreenReaderOnly>
          </CloseButton>
        </Left>
        <Center>
          <FormattedMessage {...messages.filters} />
        </Center>
        <Right>
          <button onClick={onReset}>
            <FormattedMessage {...messages.resetFilters} />
          </button>
        </Right>
      </TopBarInner>
    </Container>
  );
};

export default TopBar;
