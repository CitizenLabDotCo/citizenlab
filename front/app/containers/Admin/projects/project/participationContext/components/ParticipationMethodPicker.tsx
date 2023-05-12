import React from 'react';

// components
import {
  IconTooltip,
  Radio,
  Text,
  Box,
} from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import FeatureFlag from 'components/FeatureFlag';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import { LabelHeaderDescription } from './labels';
import { ParticipationMethodRadio } from './styling';

// i18n
import messages from '../../messages';

// typings
import { ParticipationMethod } from 'services/participationContexts';
import { ApiErrors } from '..';
import { getMethodConfig } from 'utils/participationMethodUtils';
import { isNilOrError } from 'utils/helperUtils';
import { IPhase } from 'services/phases';
import { IProjectData } from 'api/projects/types';
import Warning from 'components/UI/Warning';

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

export const ParticipationMethodPicker = ({
  participation_method,
  showSurveys,
  apiErrors,
  phase,
  project,
  handleParticipationMethodOnChange,
}: Props) => {
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
          <FeatureFlag name="participatory_budgeting">
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="budgeting"
              name="participationmethod"
              id={'participationmethod-budgeting'}
              label={
                <LabelHeaderDescription
                  header={
                    <FormattedMessage
                      {...messages.conductParticipatoryBudgetingText}
                    />
                  }
                  description={
                    <FormattedMessage
                      {...messages.conductParticipatoryBudgetingDescriptionText}
                    />
                  }
                />
              }
            />
          </FeatureFlag>
          <FeatureFlag name="polls">
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="poll"
              name="participationmethod"
              id={'participationmethod-poll'}
              label={
                <LabelHeaderDescription
                  header={<FormattedMessage {...messages.createPoll} />}
                  description={
                    <FormattedMessage {...messages.createPollDescription} />
                  }
                />
              }
            />
          </FeatureFlag>
          <FeatureFlag name="native_surveys">
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="native_survey"
              name="participationmethod"
              id={'participationmethod-native_survey'}
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
          </FeatureFlag>
          {showSurveys && (
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="survey"
              name="participationmethod"
              id={'participationmethod-survey'}
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
          <FeatureFlag name="volunteering">
            <ParticipationMethodRadio
              onChange={handleParticipationMethodOnChange}
              currentValue={participation_method}
              value="volunteering"
              name="participationmethod"
              id={'participationmethod-volunteering'}
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
          </FeatureFlag>
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
