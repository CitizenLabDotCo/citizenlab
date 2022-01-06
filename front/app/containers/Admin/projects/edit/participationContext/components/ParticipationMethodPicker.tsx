import React from 'react';

// components
import { IconTooltip, Radio } from '@citizenlab/cl2-component-library';
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

interface Props {
  participation_method: string;
  showSurveys: boolean;
  apiErrors: ApiErrors;
  handleParticipationMethodOnChange: (
    participation_method: ParticipationMethod
  ) => void;
}

export default ({
  participation_method,
  showSurveys,
  apiErrors,
  handleParticipationMethodOnChange,
}: Props) => (
  <SectionField>
    <SubSectionTitle>
      <FormattedMessage {...messages.participationMethodTitleText} />
      <IconTooltip
        content={<FormattedMessage {...messages.participationMethodTooltip} />}
      />
    </SubSectionTitle>
    <ParticipationMethodRadio
      onChange={handleParticipationMethodOnChange}
      currentValue={participation_method}
      value="ideation"
      name="participationmethod"
      id="participationmethod-ideation"
      label={
        <LabelHeaderDescription
          header="inputAndFeedback"
          description="inputAndFeedbackDescription"
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
            header="conductParticipatoryBudgetingText"
            description="conductParticipatoryBudgetingDescriptionText"
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
            header="createPoll"
            description="createPollDescription"
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
            header="createSurveyText"
            description="createSurveyDescription"
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
            header="findVolunteers"
            description="findVolunteersDescriptionText"
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
          header="shareInformation"
          description="shareInformationDescription"
        />
      }
    />
    <Error apiErrors={apiErrors && apiErrors.participation_method} />
  </SectionField>
);
