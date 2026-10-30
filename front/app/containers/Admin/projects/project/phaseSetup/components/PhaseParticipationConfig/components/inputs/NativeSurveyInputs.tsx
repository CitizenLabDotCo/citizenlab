import React from 'react';

import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc } from 'typings';

import { IPhase, IUpdatedPhaseProperties } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import PhaseActionAccessRow from 'containers/Admin/projects/_shared/components/PhaseActionAccessRow';
import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import PanelHeading from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelHeading';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import SettingToggleRow from 'components/admin/SettingToggleRow';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import projectMessages from '../../../../../messages';
import parentMessages from '../../../../messages';
import configMessages from '../../messages';

interface Props {
  apiErrors: CLErrors | null;
  phase?: IPhase;
  formData: IUpdatedPhaseProperties;
  handleSurveyTitleChange: (
    value: Multiloc,
    locale: string | undefined
  ) => void;
  handleSurveyCTAChange: (value: Multiloc, locale: string | undefined) => void;
  handleAllowMultipleResponsesChange: (value: boolean) => void;
  layout?: 'page' | 'panel';
}

const NativeSurveyInputs = ({
  apiErrors,
  phase,
  formData,
  handleSurveyTitleChange,
  handleSurveyCTAChange,
  handleAllowMultipleResponsesChange,
  layout = 'page',
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(
    phase?.data.relationships.project.data.id
  );

  const toggleAllowMultipleResponses = () =>
    handleAllowMultipleResponsesChange(!formData.allow_multiple_responses);

  const openSurveyPreview = (event: React.MouseEvent) => {
    if (phase) {
      window.open(
        `/projects/${project?.data.attributes.slug}/surveys/new?phase_id=${phase.data.id}`,
        '_blank'
      );
    }
    event.preventDefault();
  };

  if (layout === 'panel') {
    return (
      <>
        <Box mb="10px">
          <PanelHeading label={formatMessage(configMessages.rulesGroup)} />
        </Box>
        <PanelGroup
          label={formatMessage(configMessages.participantActionsGroup)}
          defaultOpen
        >
          {phase && (
            <PhaseActionAccessRow
              phaseId={phase.data.id}
              // Native surveys store their responses as ideas.
              action="posting_idea"
              label={configMessages.takingSurveyAction}
            />
          )}
          <SettingToggleRow
            title={formatMessage(parentMessages.allowMultipleResponsesLabel)}
            description={formatMessage(
              parentMessages.allowMultipleResponsesDescription
            )}
            checked={!!formData.allow_multiple_responses}
            onChange={toggleAllowMultipleResponses}
          />
          <Error apiErrors={apiErrors && apiErrors.allow_multiple_responses} />
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
          <Box display="flex" flexDirection="column" gap="16px">
            <Box>
              <InputMultilocWithLocaleSwitcher
                id="native-survey-title"
                type="text"
                variant="bo"
                label={formatMessage(parentMessages.surveyTitleLabel)}
                valueMultiloc={formData.native_survey_title_multiloc}
                onChange={handleSurveyTitleChange}
              />
              <Error
                apiErrors={apiErrors && apiErrors.native_survey_title_multiloc}
              />
            </Box>
            <Box>
              <InputMultilocWithLocaleSwitcher
                id="native-survey-button"
                type="text"
                variant="bo"
                label={formatMessage(parentMessages.surveyCTALabel)}
                valueMultiloc={formData.native_survey_button_multiloc}
                onChange={handleSurveyCTAChange}
              />
              <Error
                apiErrors={apiErrors && apiErrors.native_survey_button_multiloc}
              />
            </Box>
            <Box display="flex" flexDirection="column" gap="4px">
              <Text variant="boMicro" m="0">
                {formatMessage(parentMessages.previewSurveyCTALabel)}
              </Text>
              <ButtonWithLink
                buttonStyle="bo-secondary"
                boSize="medium"
                width="fit-content"
                onClick={openSurveyPreview}
              >
                {localize(formData.native_survey_button_multiloc)}
              </ButtonWithLink>
            </Box>
          </Box>
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
        <ButtonWithLink width="fit-content" onClick={openSurveyPreview}>
          {localize(formData.native_survey_button_multiloc)}
        </ButtonWithLink>
      </SectionField>
    </Box>
  );
};

export default NativeSurveyInputs;
