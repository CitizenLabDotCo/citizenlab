import React, { ReactNode, useId } from 'react';

import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc } from 'typings';

import { FieldError } from 'design-system/Field';

import { IPhase, IUpdatedPhaseProperties } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import PhaseActionAccessRow from 'containers/Admin/projects/_shared/components/PhaseActionAccessRow';
import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import PanelHeading from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelHeading';

import MultilocTextField from 'components/admin/MultilocFields/MultilocTextField';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import SettingToggleRow from 'components/admin/SettingToggleRow';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import projectMessages from '../../../../../messages';
import parentMessages from '../../../../messages';
import configMessages from '../../messages';

import styles from './NativeSurveyInputs.module.css';
import 'design-system/tokens.css';

interface Props {
  surveyPlacement?: ReactNode;
  apiErrors: CLErrors | null;
  phase?: IPhase;
  formData: IUpdatedPhaseProperties;
  handleSurveyTitleChange: (
    value: Multiloc,
    locale: string | undefined
  ) => void;
  handleSurveyCTAChange: (value: Multiloc, locale: string | undefined) => void;
  handleAllowMultipleResponsesChange: (value: boolean) => void;
  toggleSubmissionEnabled: () => void;
  layout?: 'page' | 'panel';
}

const NativeSurveyInputs = ({
  surveyPlacement,
  apiErrors,
  phase,
  formData,
  handleSurveyTitleChange,
  handleSurveyCTAChange,
  handleAllowMultipleResponsesChange,
  toggleSubmissionEnabled,
  layout = 'page',
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const submissionErrorId = useId();
  const multipleResponsesErrorId = useId();
  const getApiErrorMessage = useApiErrorText();
  const { data: project } = useProjectById(
    phase?.data.relationships.project.data.id
  );

  const toggleAllowMultipleResponses = () =>
    handleAllowMultipleResponsesChange(!formData.allow_multiple_responses);

  const openSurveyPreview = () => {
    if (phase) {
      window.open(
        `/projects/${project?.data.attributes.slug}/surveys/new/${phase.data.id}`,
        '_blank'
      );
    }
  };

  if (layout === 'panel') {
    const submissionError = getApiErrorMessage(apiErrors?.submission_enabled);
    const multipleResponsesError = getApiErrorMessage(
      apiErrors?.allow_multiple_responses
    );
    const titleError = getApiErrorMessage(
      apiErrors?.native_survey_title_multiloc
    );
    const ctaError = getApiErrorMessage(
      apiErrors?.native_survey_button_multiloc
    );

    return (
      <>
        <div className={styles.heading}>
          <PanelHeading
            label={formatMessage(configMessages.settingsGroup)}
            expandable
          />
        </div>
        {surveyPlacement}
        <PanelGroup
          label={formatMessage(configMessages.participantActionsGroup)}
          reviewKey="participant_actions"
          hasError={!!submissionError || !!multipleResponsesError}
        >
          <SettingToggleRow
            title={formatMessage(configMessages.acceptNewResponses)}
            description={formatMessage(
              configMessages.acceptNewResponsesDescription
            )}
            aria-describedby={submissionError ? submissionErrorId : undefined}
            checked={!!formData.submission_enabled}
            onChange={toggleSubmissionEnabled}
          />
          {submissionError && (
            <FieldError id={submissionErrorId}>{submissionError}</FieldError>
          )}
          <SettingToggleRow
            title={formatMessage(parentMessages.allowMultipleResponsesLabel)}
            description={formatMessage(
              parentMessages.allowMultipleResponsesDescription
            )}
            aria-describedby={
              multipleResponsesError ? multipleResponsesErrorId : undefined
            }
            checked={!!formData.allow_multiple_responses}
            onChange={toggleAllowMultipleResponses}
          />
          {multipleResponsesError && (
            <FieldError id={multipleResponsesErrorId}>
              {multipleResponsesError}
            </FieldError>
          )}
          {phase && (
            <PhaseActionAccessRow
              phaseId={phase.data.id}
              // Native surveys store their responses as ideas.
              action="posting_idea"
              label={configMessages.takingSurveyAction}
            />
          )}
          {phase && (
            <PhaseActionAccessRow
              phaseId={phase.data.id}
              action="attending_event"
              label={projectMessages.attendingEventAction}
            />
          )}
        </PanelGroup>
        <PanelGroup
          label={formatMessage(parentMessages.surveyTitleAndButtonGroup)}
          defaultOpen
        >
          <div className={styles.fields}>
            <MultilocTextField
              id="native-survey-title"
              label={formatMessage(parentMessages.surveyTitleLabel)}
              size={32}
              valueMultiloc={formData.native_survey_title_multiloc}
              onChange={handleSurveyTitleChange}
              errorMessage={titleError}
            />
            <MultilocTextField
              id="native-survey-button"
              label={formatMessage(parentMessages.surveyCTALabel)}
              size={32}
              valueMultiloc={formData.native_survey_button_multiloc}
              onChange={handleSurveyCTAChange}
              errorMessage={ctaError}
            />
          </div>
        </PanelGroup>
      </>
    );
  }

  return (
    <Box className="intercom-product-tour-survey-settings">
      <SectionField>
        <Toggle
          checked={!!formData.allow_multiple_responses}
          onChange={toggleAllowMultipleResponses}
          label={
            <Box ml="8px">
              <Text fontWeight="semi-bold" color="blue500" m="0px">
                {formatMessage(parentMessages.allowMultipleResponsesLabel)}
              </Text>
              <Text m="0px" color="coolGrey600" fontSize="s">
                {formatMessage(
                  parentMessages.allowMultipleResponsesDescription
                )}
              </Text>
            </Box>
          }
        />
        <Error apiErrors={apiErrors && apiErrors.allow_multiple_responses} />
      </SectionField>
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...parentMessages.surveyTitleLabel} />
        </SubSectionTitle>
        <InputMultilocWithLocaleSwitcher
          id="title"
          type="text"
          valueMultiloc={formData.native_survey_title_multiloc}
          onChange={handleSurveyTitleChange}
        />
        <Error
          apiErrors={apiErrors && apiErrors.native_survey_title_multiloc}
        />
      </SectionField>

      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...parentMessages.surveyCTALabel} />
        </SubSectionTitle>
        <InputMultilocWithLocaleSwitcher
          id="title"
          type="text"
          valueMultiloc={formData.native_survey_button_multiloc}
          onChange={handleSurveyCTAChange}
        />
        <Error
          apiErrors={apiErrors && apiErrors.native_survey_button_multiloc}
        />
      </SectionField>

      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...parentMessages.previewSurveyCTALabel} />
        </SubSectionTitle>
        <ButtonWithLink
          width="fit-content"
          onClick={(event: React.MouseEvent) => {
            openSurveyPreview();
            event.preventDefault();
          }}
        >
          {localize(formData.native_survey_button_multiloc)}
        </ButtonWithLink>
      </SectionField>
    </Box>
  );
};

export default NativeSurveyInputs;
