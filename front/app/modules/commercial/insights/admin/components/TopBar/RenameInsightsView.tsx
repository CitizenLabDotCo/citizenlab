import React, { useState } from 'react';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';

// components
import { Button, Input } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';

// services
import { updateInsightsView } from 'modules/commercial/insights/services/insightsViews';

// hooks
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
import { CLErrors } from 'typings';

const Container = styled.div`
  width: 100%;
  max-width: 350px;
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
}: RenameInsightsViewProps & InjectedIntlProps) => {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CLErrors | undefined>();

  const [name, setName] = useState<string>(originalViewName);
  const onChangeName = (value: string) => {
    setName(value);
    setErrors(undefined);
  };

  const handleSubmit = async () => {
    if (name) {
      setLoading(true);
      try {
        const result = await updateInsightsView(insightsViewId, name);
        if (!isNilOrError(result)) {
          closeRenameModal();
        }
      } catch (errors) {
        setErrors(errors.json.errors);
        setLoading(false);
      }
    }
  };

  if (isNilOrError(locale)) return null;

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
        {errors && <Error apiErrors={errors['name']} fieldName="view_name" />}

        <ButtonContainer>
          <Button
            processing={loading}
            disabled={!name}
            locale={locale}
            onClick={handleSubmit}
            bgColor={colors.adminTextColor}
          >
            {formatMessage(messages.renameModalSaveView)}
          </Button>
          <Button
            locale={locale}
            onClick={closeRenameModal}
            buttonStyle="secondary"
          >
            {formatMessage(messages.renameModalCancel)}
          </Button>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

export default injectIntl<RenameInsightsViewProps>(RenameInsightsView);
