import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';
import useInsightsInput from 'modules/commercial/insights/hooks/useInsightsInput';
import { Spinner } from 'cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';
import Category from 'modules/commercial/insights/admin/components/Category';

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

const CategoryList = styled.div`
  margin-top: 50px;
  > * {
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

type PreviewProps = {
  isPreviewOpen: boolean;
  closePreview: () => void;
} & WithRouterProps;

const Preview = ({
  params: { viewId },
  location: { query, pathname },
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
  const handleOnClose = () => {
    clHistory.push({
      pathname,
      search: stringify(
        { ...query, previewedInputId: undefined },
        { addQueryPrefix: true }
      ),
    });
    closePreview();
  };

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
        onClick={handleOnClose}
      />
      <CategoryList>
        {previewedInput.relationships?.categories.data.map((category) => (
          <Category
            id={category.id}
            key={category.id}
            inputId={previewedInput.id}
          />
        ))}
      </CategoryList>
      <Idea ideaId={query.previewedInputId} />
    </Container>
  );
};

export default withRouter(Preview);
