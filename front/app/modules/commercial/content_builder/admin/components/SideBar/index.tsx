import React, { useEffect } from 'react';
import styled from 'styled-components';
import { colors, media, stylingConsts } from 'utils/styleUtils';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { withRouter, WithRouterProps } from 'react-router';

const Container = styled.div`
  flex: 0 0 auto;
  width: 210px;

  @media print {
    display: none;
  }

  ${media.smallerThan1200px`
    width: 80px;
  `}
`;

const ContainerInner = styled.nav`
  flex: 0 0 auto;
  width: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 0;
  bottom: 0;
  padding-top: ${stylingConsts.menuHeight + 10}px;
  background: ${colors.adminBackground};

  ${media.smallerThan1200px`
    width: 80px;
  `}
`;

type SideBarProps = { onMount: (isVisible: boolean) => void } & WithRouterProps;

const SideBar = ({ onMount, location: { pathname } }: SideBarProps) => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });
  const sideBarVisible =
    featureEnabled && pathname.includes('admin/content-builder');

  useEffect(() => {
    onMount(sideBarVisible);
  }, [onMount, sideBarVisible]);

  if (!sideBarVisible) {
    return null;
  }

  return (
    <Container>
      <ContainerInner>items</ContainerInner>
    </Container>
  );
};

export default withRouter(SideBar);
