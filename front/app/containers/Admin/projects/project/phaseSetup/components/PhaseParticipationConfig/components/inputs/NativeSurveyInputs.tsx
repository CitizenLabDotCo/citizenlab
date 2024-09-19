import React from 'react';

import { Box, IconTooltip, Text } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc } from 'typings';

import { IPhase, IUpdatedPhaseProperties } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import AnonymousPostingToggle from 'components/admin/AnonymousPostingToggle/AnonymousPostingToggle';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import parentMessages from '../../../../messages';
import messages from '../messages';

interface Props {
  allow_anonymous_participation: boolean | null | undefined;
  apiErrors: CLErrors | null;
  phase?: IPhase;
  phaseAttrs: IUpdatedPhaseProperties;
  handleAllowAnonymousParticipationOnChange: (
    allow_anonymous_participation: boolean
  ) => void;
  handleSurveyTitleChange: (
    value: Multiloc,
    locale: string | undefined
  ) => void;
  handleSurveyCTAChange: (value: Multiloc, locale: string | undefined) => void;
}

const NativeSurveyInputs = ({
  allow_anonymous_participation,
  apiErrors,
  phase,
  phaseAttrs,
  handleAllowAnonymousParticipationOnChange,
  handleSurveyTitleChange,
  handleSurveyCTAChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: project } = useProjectById(
    phase?.data.relationships.project.data.id
  );

  return (
    <>
      <AnonymousPostingToggle
        allow_anonymous_participation={allow_anonymous_participation}
        handleAllowAnonymousParticipationOnChange={
          handleAllowAnonymousParticipationOnChange
        }
        toggleLabel={
          <Box ml="8px">
            <Box display="flex">
              <Text
                color="primary"
                mb="0px"
                fontSize="m"
                style={{ fontWeight: 600 }}
              >
                <FormattedMessage {...messages.userAnonymityLabelMain} />
              </Text>
              <Box ml="4px" mt="16px">
                <IconTooltip
                  placement="top-start"
                  content={formatMessage(messages.userAnonymityLabelTooltip)}
                />
              </Box>
            </Box>

            <Text color="coolGrey600" mt="0px" fontSize="m">
              <FormattedMessage {...messages.userAnonymityLabelSubtext} />
            </Text>
          </Box>
        }
      />
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...parentMessages.surveyTitleLabel} />
        </SubSectionTitle>
        <InputMultilocWithLocaleSwitcher
          id="title"
          type="text"
          valueMultiloc={phaseAttrs.native_survey_title_multiloc}
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
          valueMultiloc={phaseAttrs.native_survey_button_multiloc}
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
        <Button
          width="fit-content"
          onClick={(event) => {
            if (phase) {
              window.open(
                `/projects/${project?.data.attributes.slug}/surveys/new?phase_id=${phase.data.id}`,
                '_blank'
              );
            }
            event.preventDefault();
          }}
        >
          {localize(phaseAttrs.native_survey_button_multiloc)}
        </Button>
      </SectionField>
    </>
  );
};

export default NativeSurveyInputs;
