import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import useInsightsInput from 'modules/commercial/insights/hooks/useInsightsInput';
import { Spinner } from 'cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';

// components
import Button from 'components/UI/Button';
import Idea from 'modules/commercial/insights/admin/components/Idea';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: #fff;
  overflow-y: auto;
  padding: 120px;
`;

const CloseButton = styled(Button)`
  position: absolute;
  top: 12px;
  right: 12px;
`;

type PreviewProps = {
  isPreviewOpen: boolean;
  closePreview: () => void;
} & WithRouterProps;

const Preview = ({
  params: { viewId },
  location: { query },
  isPreviewOpen,
  closePreview,
}: PreviewProps) => {
  if (!isPreviewOpen) {
    return null;
  }
  const previewedInput = useInsightsInput(viewId, query.previewedInputId);

  // Loading state
  if (previewedInput === undefined) {
    return (
      <Container data-testid="insightsDetailsPreviewLoading">
        <Spinner />
      </Container>
    );
  }

  if (isNilOrError(previewedInput)) {
    return null;
  }

  return (
    <Container>
      <CloseButton
        width="26px"
        height="26px"
        padding="0px"
        buttonStyle="white"
        icon="close"
        iconSize="12px"
        boxShadow="none"
        boxShadowHover="none"
        onClick={closePreview}
      />
      <Idea ideaId={query.previewedInputId} />
    </Container>
  );
};

export default withRouter(Preview);
