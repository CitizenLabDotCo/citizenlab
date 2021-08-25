import React from 'react';
import { removeFocus } from 'utils/helperUtils';

// components
import { Icon } from 'cl2-component-library';

// styles
import styled from 'styled-components';
import { media, defaultOutline } from 'utils/styleUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const Container = styled.nav`
  bottom: ${(props) => props.theme.mobileMenuHeight}px;
  position: fixed;
  background: #fff;
  height: 100%;
  width: 100%;
  z-index: 1004;
  padding-top: 100px;
`;

const Overlay = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  padding-left: 30px;
  padding-right: 30px;
  overflow: hidden;
  z-index: 1000001;
`;

const CloseButton = styled.button`
  width: 30px;
  height: 30px;
  position: absolute;
  top: 19px;
  right: 25px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  border-radius: 50%;
  border: solid 1px transparent;
  background: #fff;
  transition: all 100ms ease-out;
  outline: none !important;

  &:hover {
    background: #e0e0e0;
  }

  &.focus-visible {
    ${defaultOutline};
  }

  ${media.smallerThanMinTablet`
    top: 13px;
    right: 15px;
  `}
`;

const CloseIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  fill: ${(props: any) => props.theme.colorText};
`;
const MenuItems = styled.ul``;
const MenuItem = styled.li``;

interface Props {
  onClose: () => void;
}

const FullNavMenu = ({
  intl: { formatMessage },
  onClose,
}: Props & InjectedIntlProps) => {
  const handleOnClose = () => {
    onClose();
  };
  return (
    <Container>
      <Overlay>
        <CloseButton onMouseDown={removeFocus} onClick={handleOnClose}>
          <CloseIcon
            title={formatMessage(messages.closeMobileNavMenu)}
            name="close"
          />
        </CloseButton>
        <MenuItems>
          <MenuItem>Test</MenuItem>
        </MenuItems>
      </Overlay>
    </Container>
  );
};

export default injectIntl(FullNavMenu);
