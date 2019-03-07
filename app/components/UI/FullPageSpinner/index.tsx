import React from 'react';

// components
import Spinner from 'components/UI/Spinner';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

export interface Props {
  admin?: boolean;
}

// Centered spinner taking the navbar height (and admin sidebar) into account
const FullPageContainer: any = styled.div`
  position: fixed;
  top: ${props => props.theme.menuHeight}px;
  left: ${(props: Props) => props.admin ? '260px' : '0'};
  width: ${(props: Props) => props.admin ? 'calc(100% - 260px)' : '100%'}; ;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const SpinnerCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  // Spinner is 32px width/height by default, 16px is half of that
  margin-top: -16px;
  margin-left: -16px;
`;

const FullPageSpinner = (props: Props) => {
  const { admin } = props;
  return (
    <FullPageContainer admin={admin}>
      <SpinnerCenter>
        <Spinner />
      </SpinnerCenter>
    </FullPageContainer>
  );
};

export default FullPageSpinner;
