import React from 'react';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { Multiloc } from 'typings';
import { ideaStatusCodes, TIdeaStatusCode } from 'api/idea_statuses/types';

// components
import { Section, SectionField } from 'components/admin/Section';
import {
  Label,
  IconTooltip,
  Box,
  Button,
} from '@citizenlab/cl2-component-library';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import TextAreaMultilocWithLocaleSwitcher from 'components/HookForm/TextAreaMultilocWithLocaleSwitcher';
import RadioGroup from 'components/HookForm/RadioGroup';
import Radio from 'components/HookForm/RadioGroup/Radio';

import ColorPicker from 'components/HookForm/ColorPicker';
import Feedback from 'components/HookForm/Feedback';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

export interface FormValues {
  color: string;
  code: TIdeaStatusCode;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export type Props = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: Partial<FormValues>;
};

const StyledSection = styled(Section)`
  margin-bottom: 40px;
`;

const LabelText = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -2px;

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .header {
    padding: 0;
    margin: 0;
    margin-bottom: 3px;
    font-weight: 600;
    font-size: ${fontSizes.base}px;
  }

  .description {
    color: ${colors.textSecondary};
  }
`;

const StyledLabel = styled(Label)`
  margin-bottom: 32px;
`;

const IdeaStatusForm = ({ defaultValues, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const schema = object({
    color: string(),
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldTitleError)
    ),
    description_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldDescriptionError)
    ),
    code: string().required(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <StyledSection>
          <SectionField>
            <Feedback />
          </SectionField>
          <SectionField>
            <ColorPicker
              label={formatMessage(messages.fieldColor)}
              name="color"
            />
          </SectionField>
        </StyledSection>
        <StyledSection>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              label={formatMessage(messages.fieldTitle)}
              name="title_multiloc"
            />
          </SectionField>
        </StyledSection>

        <StyledSection>
          <SectionField>
            <TextAreaMultilocWithLocaleSwitcher
              label={formatMessage(messages.fieldDescription)}
              name="description_multiloc"
            />
          </SectionField>
        </StyledSection>

        <StyledSection>
          <SectionField>
            <StyledLabel>
              <FormattedMessage {...messages.category} />
              <IconTooltip
                content={<FormattedMessage {...messages.categoryDescription} />}
              />
            </StyledLabel>
            <RadioGroup name="code">
              {ideaStatusCodes.map((code: TIdeaStatusCode, i) => (
                <Radio
                  key={`code-input-${i}`}
                  label={
                    <LabelText>
                      <span className="header">
                        {formatMessage(
                          {
                            proposed: messages.proposedFieldCodeTitle,
                            viewed: messages.viewedFieldCodeTitle,
                            under_consideration:
                              messages.under_considerationFieldCodeTitle,
                            accepted: messages.acceptedFieldCodeTitle,
                            implemented: messages.implementedFieldCodeTitle,
                            rejected: messages.rejectedFieldCodeTitle,
                            custom: messages.customFieldCodeTitle,
                          }[code]
                        )}
                      </span>
                      {code !== 'custom' && (
                        <span className="description">
                          {formatMessage(
                            {
                              proposed: messages.proposedFieldCodeDescription,
                              viewed: messages.viewedFieldCodeDescription,
                              under_consideration:
                                messages.under_considerationFieldCodeDescription,
                              accepted: messages.acceptedFieldCodeDescription,
                              implemented:
                                messages.implementedFieldCodeDescription,
                              rejected: messages.rejectedFieldCodeDescription,
                            }[code]
                          )}
                        </span>
                      )}
                    </LabelText>
                  }
                  id={`${code}-input`}
                  name="code"
                  value={code}
                />
              ))}
            </RadioGroup>
          </SectionField>
        </StyledSection>
        <Box display="flex">
          <Button type="submit" processing={methods.formState.isSubmitting}>
            {formatMessage(messages.saveStatus)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default IdeaStatusForm;
