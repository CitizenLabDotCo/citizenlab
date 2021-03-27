import React from 'react';

// components
import { Spinner } from 'cl2-component-library';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

export interface Props {
  admin?: boolean;
}

// Centered spinner taking the navbar height (and admin sidebar) into account
const FullPageContainer: any = styled.div`
  position: fixed;
  top: ${(props) => props.theme.menuHeight}px;
  // 260px is the width of the admin sidebar
  left: ${(props: Props) => (props.admin ? '260px' : '0')};
  width: ${(props: Props) => (props.admin ? 'calc(100% - 260px)' : '100%')};
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  justify-content: center;
  align-items: center;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const FullPageSpinner = (props: Props) => {
  const { admin } = props;
  return (
    <FullPageContainer admin={admin}>
      <Spinner />
    </FullPageContainer>
  );
};

export default FullPageSpinner;
