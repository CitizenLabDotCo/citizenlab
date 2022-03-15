import React, { useEffect } from 'react';
import styled from 'styled-components';
import { colors, media, stylingConsts } from 'utils/styleUtils';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { withRouter, WithRouterProps } from 'react-router';
import { RightColumn } from 'containers/Admin';
import { Editor } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';
import ContentBuilderToolbox from '../ContentBuilderToolbox';
import CraftContainer from '../CraftContainer';

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

type ContentBuilderLayoutProps = {
  onMount: (isVisible: boolean) => void;
} & WithRouterProps;

const ContentBuilderLayout: React.FC<ContentBuilderLayoutProps> = ({
  children,
  onMount,
  location: { pathname },
}) => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });
  const contentBuilderLayoutVisible =
    featureEnabled && pathname.includes('admin/content-builder');

  useEffect(() => {
    onMount(contentBuilderLayoutVisible);
  }, [onMount, contentBuilderLayoutVisible]);

  if (!contentBuilderLayoutVisible) {
    return null;
  }

  return (
    <Editor resolver={{ Box, CraftContainer }}>
      <Container>
        <ContainerInner>
          <ContentBuilderToolbox />
        </ContainerInner>
      </Container>
      <RightColumn>{children}</RightColumn>
    </Editor>
  );
};

export default withRouter(ContentBuilderLayout);
