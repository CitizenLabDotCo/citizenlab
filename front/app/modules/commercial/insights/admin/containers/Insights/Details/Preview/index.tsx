import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

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
  padding: 40px;
`;

const CloseButton = styled(Button)`
  position: absolute;
  top: 12px;
  right: 12px;
`;

const Preview = ({ location: { query, pathname } }: WithRouterProps) => {
  if (!query.previewedInputId) {
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
      <Idea ideaId={query.previewedInputId} />
    </Container>
  );
};

export default withRouter(Preview);
