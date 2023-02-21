import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';

// components
import { Button, Input } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';

// services
import useUpdateCategory from 'modules/commercial/insights/api/categories/useUpdateCategory';

// utils

// types

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

const Container = styled.div`
  width: 100%;
  max-width: 400px;
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

type RenameCategoryProps = {
  closeRenameModal: () => void;
  originalCategoryName: string;
} & WrappedComponentProps &
  WithRouterProps;

const RenameCategory = ({
  closeRenameModal,
  originalCategoryName,
  intl: { formatMessage },
  params: { viewId },
  location: { query },
}: RenameCategoryProps) => {
  const { mutate, error, isLoading, reset } = useUpdateCategory();

  const [name, setName] = useState<string>(originalCategoryName);

  const onChangeName = (value: string) => {
    setName(value);
    reset();
  };

  const handleSubmit = () => {
    if (name) {
      mutate(
        { viewId, categoryId: query.category, requestBody: { name } },
        {
          onSuccess: closeRenameModal,
        }
      );
      trackEventByName(tracks.editCategory);
    }
  };

  return (
    <Container data-testid="insights">
      <Title>{formatMessage(messages.renameCategoryModalTitle)}</Title>
      <Form>
        <Input
          type="text"
          value={name}
          onChange={onChangeName}
          label={formatMessage(messages.renameCategoryModalNameLabel)}
        />
        {error && (
          <Error apiErrors={error.errors['name']} fieldName="category_name" />
        )}

        <ButtonContainer>
          <Button
            processing={isLoading}
            disabled={!name}
            onClick={handleSubmit}
            bgColor={colors.primary}
          >
            {formatMessage(messages.renameCategoryModalSave)}
          </Button>
          <Button onClick={closeRenameModal} buttonStyle="secondary">
            {formatMessage(messages.renameCategoryModalCancel)}
          </Button>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

export default withRouter(injectIntl<RenameCategoryProps>(RenameCategory));
