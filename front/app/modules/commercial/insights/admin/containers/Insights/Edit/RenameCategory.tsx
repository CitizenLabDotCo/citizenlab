import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';

// components
import { Button, Input } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';

// services
import { updateInsightsCategory } from 'modules/commercial/insights/services/insightsCategories';

// hooks
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
import { CLErrors } from 'typings';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

const Container = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 40px auto;
  color: ${colors.adminTextColor};
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
} & InjectedIntlProps &
  WithRouterProps;

const RenameCategory = ({
  closeRenameModal,
  originalCategoryName,
  intl: { formatMessage },
  params: { viewId },
  location: { query },
}: RenameCategoryProps) => {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CLErrors | undefined>();

  const [name, setName] = useState<string>(originalCategoryName);
  const onChangeName = (value: string) => {
    setName(value);
    setErrors(undefined);
  };

  const handleSubmit = async () => {
    if (name) {
      setLoading(true);
      try {
        const result = await updateInsightsCategory(
          viewId,
          query.category,
          name
        );
        if (!isNilOrError(result)) {
          closeRenameModal();
        }
      } catch (errors) {
        setErrors(errors.json.errors);
        setLoading(false);
      }
      trackEventByName(tracks.editCategory);
    }
  };

  if (isNilOrError(locale)) return null;

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
        {errors && (
          <Error apiErrors={errors['name']} fieldName="category_name" />
        )}

        <ButtonContainer>
          <Button
            processing={loading}
            disabled={!name}
            locale={locale}
            onClick={handleSubmit}
            bgColor={colors.adminTextColor}
          >
            {formatMessage(messages.renameCategoryModalSave)}
          </Button>
          <Button
            locale={locale}
            onClick={closeRenameModal}
            buttonStyle="secondary"
          >
            {formatMessage(messages.renameCategoryModalCancel)}
          </Button>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

export default withRouter(injectIntl<RenameCategoryProps>(RenameCategory));
