import React from 'react';

import {
  Radio,
  Input,
  LocaleSwitcher,
  Box,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc, SupportedLocale, MultilocFormValues } from 'typings';

import { IOfficialFeedbackData as IIdeaOfficialFeedbackData } from 'api/idea_official_feedback/types';
import { IOfficialFeedbackData as IInitiativeOfficialFeedbackData } from 'api/initiative_official_feedback/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { Section } from 'components/admin/Section';
import OfficialFeedbackPost from 'components/PostShowComponents/OfficialFeedback/OfficialFeedbackPost';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import MentionsTextArea from 'components/UI/MentionsTextArea';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

import { Mode } from './StatusChangeFormWrapper';

const StyledSection = styled(Section)``;

const StyledLocaleSwitcher = styled(LocaleSwitcher)`
  margin: 10px 0;
`;

const StyledMentionsTextArea = styled(MentionsTextArea)`
  margin-bottom: 15px;
`;

const StyledInput = styled(Input)``;

const ChangeStatusButton = styled(Button)`
  margin-top: 25px;
`;

export interface FormValues extends MultilocFormValues {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

interface Props {
  loading: boolean;
  error: boolean;
  newOfficialFeedback: FormValues;
  mode: 'latest' | 'new';
  latestOfficialFeedback:
    | IIdeaOfficialFeedbackData
    | IInitiativeOfficialFeedbackData
    | null;
  onChangeMode: (value: Mode) => void;
  onChangeBody: (value: Multiloc) => void;
  onChangeAuthor: (value: Multiloc) => void;
  submit: () => void;
  valid: boolean;
}

const StatusChangeForm = ({
  latestOfficialFeedback,
  submit,
  loading,
  error,
  valid,
  mode,
  newOfficialFeedback,
  onChangeAuthor,
  onChangeBody,
  onChangeMode,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [selectedLocale, setLocale] = React.useState<SupportedLocale>(locale);
  const tenantLocales = useAppConfigurationLocales();
  const renderFullForm = () => {
    if (!latestOfficialFeedback) return null;

    return (
      <>
        <Box mt="12px">
          <Radio
            onChange={onChangeMode}
            currentValue={mode}
            value="new"
            name="statusChangeMethod"
            label={formatMessage(messages.newFeedbackMode)}
            id="status-change-radio-new"
          />
        </Box>

        {mode === 'new' && renderFeedbackForm()}

        <Box mt="12px">
          <Radio
            onChange={onChangeMode}
            currentValue={mode}
            value="latest"
            name="statusChangeMethod"
            label={formatMessage(messages.latestFeedbackMode)}
            id="status-change-radio-latest"
          />
        </Box>
        {mode === 'latest' && (
          <OfficialFeedbackPost
            editingAllowed={false}
            officialFeedbackPost={latestOfficialFeedback}
            postType="initiative"
          />
        )}
      </>
    );
  };

  const onLocaleChange = (locale: SupportedLocale) => {
    setLocale(locale);
  };

  const handleBodyOnChange = (
    value: string,
    locale: SupportedLocale | undefined
  ) => {
    if (locale && onChangeBody) {
      onChangeBody({
        ...newOfficialFeedback.body_multiloc,
        [locale]: value,
      });
    }
  };

  const handleAuthorOnChange = (
    value: string,
    locale: SupportedLocale | undefined
  ) => {
    if (locale && onChangeAuthor) {
      onChangeAuthor({
        ...newOfficialFeedback.author_multiloc,
        [locale]: value,
      });
    }
  };

  const renderFeedbackForm = () => {
    if (!isNilOrError(tenantLocales)) {
      return (
        <StyledSection>
          <StyledLocaleSwitcher
            onSelectedLocaleChange={onLocaleChange}
            locales={tenantLocales}
            selectedLocale={selectedLocale}
            values={newOfficialFeedback}
          />

          <StyledMentionsTextArea
            placeholder={formatMessage(messages.feedbackBodyPlaceholder)}
            rows={8}
            padding="12px"
            background="#fff"
            ariaLabel={formatMessage(messages.officialUpdateBody)}
            name="body_multiloc"
            value={newOfficialFeedback.body_multiloc?.[selectedLocale] || ''}
            locale={selectedLocale}
            onChange={handleBodyOnChange}
          />

          <StyledInput
            type="text"
            value={newOfficialFeedback?.author_multiloc?.[selectedLocale] || ''}
            locale={selectedLocale}
            placeholder={formatMessage(messages.feedbackAuthorPlaceholder)}
            ariaLabel={formatMessage(messages.officialUpdateAuthor)}
            onChange={handleAuthorOnChange}
          />
        </StyledSection>
      );
    }

    return null;
  };

  return (
    <>
      {latestOfficialFeedback ? renderFullForm() : renderFeedbackForm()}
      <ChangeStatusButton
        processing={loading}
        disabled={!valid}
        onClick={submit}
        bgColor={colors.teal}
      >
        <FormattedMessage {...messages.statusChangeSave} />
      </ChangeStatusButton>
      {error && (
        <Error text={formatMessage(messages.statusChangeGenericError)} />
      )}
    </>
  );
};

export default StatusChangeForm;
