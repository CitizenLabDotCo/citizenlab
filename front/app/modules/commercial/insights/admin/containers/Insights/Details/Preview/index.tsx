import React, { useRef, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';
import useInsightsInput from 'modules/commercial/insights/hooks/useInsightsInput';
import { Spinner } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';

// components
import Button from 'components/UI/Button';
import Idea from 'modules/commercial/insights/admin/components/Idea';
import Category from 'modules/commercial/insights/admin/components/Category';

const Container = styled.div`
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
  margin-bottom: 12px;
  > * {
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

const Preview = ({
  params: { viewId },
  location: { query, pathname },
}: WithRouterProps) => {
  const previewedInput = useInsightsInput(viewId, query.previewedInputId);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    previewRef.current && previewRef.current.scrollTo(0, 0);
  }, [query.previewedInputId]);

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
    clHistory.replace({
      pathname,
      search: stringify(
        { ...query, previewedInputId: undefined },
        { addQueryPrefix: true, indices: false }
      ),
    });
  };

  return (
    <Container ref={previewRef} data-testid="insightsDetailsPreview">
      <div data-testid="insightsDetailsPreviewClose">
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
      </div>
      <CategoryList>
        {previewedInput.relationships?.categories.data.map((category) => (
          <Category
            id={category.id}
            key={category.id}
            inputId={previewedInput.id}
            variant="approved"
            withAction={false}
          />
        ))}
      </CategoryList>
      <Idea ideaId={query.previewedInputId} />
    </Container>
  );
};

export default withRouter(Preview);
