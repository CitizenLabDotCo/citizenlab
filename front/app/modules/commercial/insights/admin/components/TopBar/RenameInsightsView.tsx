import React, { useState } from 'react';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';

// components
import { Button, Input } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';

import { useUpdateView } from 'modules/commercial/insights/services/views';

const Container = styled.div`
  width: 100%;
  max-width: 350px;
  margin: 40px auto;
  color: ${colors.primary};
`;

const Title = styled.h1`
  text-align: center;
  font-size: ${fontSizes.xxl}px;
`;

const Form = styled.form`
  margin-top: 40px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;

  > :not(:first-child) {
    margin-left: 5px;
  }
`;

interface RenameInsightsViewProps {
  closeRenameModal: () => void;
  insightsViewId: string;
  originalViewName: string;
}

const RenameInsightsView = ({
  closeRenameModal,
  insightsViewId,
  originalViewName,
  intl: { formatMessage },
}: RenameInsightsViewProps & WrappedComponentProps) => {
  const { mutate, isLoading, error, reset, isSuccess } = useUpdateView();

  const [name, setName] = useState<string>(originalViewName);
  const onChangeName = (value: string) => {
    setName(value);
    reset();
  };

  const handleSubmit = async () => {
    if (name) {
      mutate({ id: insightsViewId, name });
    }
    if (isSuccess) {
      closeRenameModal();
    }
  };

  return (
    <Container data-testid="insights">
      <Title>{formatMessage(messages.renameModalTitle)}</Title>
      <Form>
        <Input
          type="text"
          value={name}
          onChange={onChangeName}
          label={formatMessage(messages.renameModalNameLabel)}
        />
        {error && (
          <Error apiErrors={error.errors['name']} fieldName="view_name" />
        )}

        <ButtonContainer>
          <Button
            processing={isLoading}
            disabled={!name}
            onClick={handleSubmit}
            bgColor={colors.primary}
          >
            {formatMessage(messages.renameModalSaveView)}
          </Button>
          <Button onClick={closeRenameModal} buttonStyle="secondary">
            {formatMessage(messages.renameModalCancel)}
          </Button>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

export default injectIntl(RenameInsightsView);
