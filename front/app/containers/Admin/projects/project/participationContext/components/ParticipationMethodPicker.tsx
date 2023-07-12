import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import {
  IconTooltip,
  Radio,
  Text,
  Box,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import { LabelHeaderDescription } from './shared/labels';
import { ParticipationMethodRadio } from './shared/styling';
import Warning from 'components/UI/Warning';
import Tippy from '@tippyjs/react';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../messages';

// utils
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { ParticipationMethod } from 'services/participationContexts';
import { ApiErrors } from '..';
import { IPhase } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

interface Props {
  participation_method: ParticipationMethod;
  phase?: IPhase | undefined | null;
  project?: IProjectData | undefined | null;
  showSurveys: boolean;
  apiErrors: ApiErrors;
  handleParticipationMethodOnChange: (
    participation_method: ParticipationMethod
  ) => void;
}

const ParticipationMethodPicker = ({
  participation_method,
  showSurveys,
  apiErrors,
  phase,
  project,
  handleParticipationMethodOnChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const documentAnnotationAllowed = useFeatureFlag({
    name: 'konveio_document_annotation',
    onlyCheckAllowed: true,
  });
  const documentAnnotationEnabled = useFeatureFlag({
    name: 'konveio_document_annotation',
  });
  const pollsEnabled = useFeatureFlag({
    name: 'polls',
  });
  const nativeSurveysEnabled = useFeatureFlag({
    name: 'native_surveys',
  });
  const volunteeringEnabled = useFeatureFlag({
    name: 'volunteering',
  });

  const chooseParticipationMethod = () => {
    if (!isNilOrError(phase) && phase.data) {
      return phase.data.attributes.participation_method;
    }
    if (!isNilOrError(project)) {
      return project.attributes.participation_method;
    }
    // Before a new project or phase is saved, use ideation as a default
    // fallback config to control the radio behaviour.
    return 'ideation';
  };

  const isExistingProjectOrPhase =
    !isNilOrError(project) || !isNilOrError(phase?.data);

  const config = getMethodConfig(chooseParticipationMethod());

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.participationMethodTitleText} />
        {!config.isMethodLocked && (
          <IconTooltip
            content={
              <FormattedMessage {...messages.participationMethodTooltip} />
            }
          />
        )}
      </SubSectionTitle>
      {isExistingProjectOrPhase && (
        <Box id="e2e-participation-method-warning" mb="24px">
          <Warning>
            <FormattedMessage
              {...(!isNilOrError(phase)
                ? messages.phaseMethodChangeWarning
                : messages.projectMethodChangeWarning)}
            />
          </Warning>
        </Box>
      )}
      {!config.isMethodLocked ? (
        <>
          <ParticipationMethodRadio
            onChange={handleParticipationMethodOnChange}
            currentValue={participation_method}
            value="ideation"
            name="participationmethod"
            id="participationmethod-ideation"
            label={
              <LabelHeaderDescription
                header={<FormattedMessage {...messages.inputAndFeedback} />}
                description={
                  <FormattedMessage {...messages.inputAndFeedbackDescription} />
                }
              />
            }
          />
          <ParticipationMethodRadio
            onChange={handleParticipationMethodOnChange}
            currentValue={participation_method}
            value="voting"
            name="participationmethod"
            id="participationmethod-voting"
            label={
              <LabelHeaderDescription
                header={
                  <FormattedMessage
                    {...messages.conductVotingOrPrioritizationText}
                  />
                }
                description={
                  <FormattedMessage
                    {...messages.conductVotingOrPrioritizationDescriptionText}
                  />
                }
              />
            }
          />
          {pollsEnabled && (
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="poll"
              name="participationmethod"
              id="participationmethod-poll"
              label={
                <LabelHeaderDescription
                  header={<FormattedMessage {...messages.createPoll} />}
                  description={
                    <FormattedMessage {...messages.createPollDescription} />
                  }
                />
              }
            />
          )}
          {nativeSurveysEnabled && (
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="native_survey"
              name="participationmethod"
              id="participationmethod-native_survey"
              disabled={isExistingProjectOrPhase}
              label={
                <LabelHeaderDescription
                  disabled={isExistingProjectOrPhase}
                  header={<FormattedMessage {...messages.createNativeSurvey} />}
                  description={
                    <FormattedMessage
                      {...messages.createNativeSurveyDescription}
                    />
                  }
                />
              }
            />
          )}
          {showSurveys && (
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="survey"
              name="participationmethod"
              id="participationmethod-survey"
              label={
                <LabelHeaderDescription
                  header={
                    <FormattedMessage {...messages.createExternalSurveyText} />
                  }
                  description={
                    <FormattedMessage {...messages.createSurveyDescription} />
                  }
                />
              }
            />
          )}
          {documentAnnotationAllowed && (
            <Tippy
              maxWidth="250px"
              placement="right-end"
              content={formatMessage(messages.contactGovSuccessToAccess)}
              // Don't show Tippy tooltip if the feature is enabled
              disabled={documentAnnotationEnabled}
              hideOnClick={false}
            >
              <div>
                <ParticipationMethodRadio
                  disabled={!documentAnnotationEnabled}
                  onChange={handleParticipationMethodOnChange}
                  currentValue={participation_method}
                  value="document_annotation"
                  name="participationmethod"
                  id="participationmethod-document_annotation"
                  label={
                    <LabelHeaderDescription
                      disabled={!documentAnnotationEnabled}
                      header={
                        <FormattedMessage
                          {...messages.documentAnnotationMethod}
                        />
                      }
                      description={
                        <FormattedMessage
                          {...messages.documentAnnotationMethodDescription}
                        />
                      }
                    />
                  }
                />
              </div>
            </Tippy>
          )}
          {volunteeringEnabled && (
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="volunteering"
              name="participationmethod"
              id="participationmethod-volunteering"
              label={
                <LabelHeaderDescription
                  header={<FormattedMessage {...messages.findVolunteers} />}
                  description={
                    <FormattedMessage
                      {...messages.findVolunteersDescriptionText}
                    />
                  }
                />
              }
            />
          )}
          <Radio
            onChange={handleParticipationMethodOnChange}
            currentValue={participation_method}
            value="information"
            name="participationmethod"
            id="participationmethod-information"
            label={
              <LabelHeaderDescription
                header={<FormattedMessage {...messages.shareInformation} />}
                description={
                  <FormattedMessage {...messages.shareInformationDescription} />
                }
              />
            }
          />
          <Error apiErrors={apiErrors && apiErrors.participation_method} />
        </>
      ) : (
        <Text margin="0" color="teal700">
          {config.getMethodPickerMessage()}
        </Text>
      )}
    </SectionField>
  );
};

export default ParticipationMethodPicker;
