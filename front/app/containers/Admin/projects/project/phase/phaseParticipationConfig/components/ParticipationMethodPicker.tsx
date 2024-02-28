import React, { useState } from 'react';
import styled from 'styled-components';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import {
  IconTooltip,
  Text,
  Box,
  Title,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';
import Tippy from '@tippyjs/react';
import ParticipationMethodChoice from './ParticipationMethodChoice';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../../messages';
import messages2 from './messages';

// utils
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { ApiErrors } from '..';
import { IPhase, ParticipationMethod } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

// assets
import ideationImage from './assets/ideation.png';
import surveyImage from './assets/survey.png';
import votingImage from './assets/voting.png';
import informationImage from './assets/information.png';
import volunteeringImage from './assets/volunteering.png';
import documentImage from './assets/document.png';

const LeftAlignedList = styled.ul`
  text-align: left;
`;

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
  const [selectedMethod, setSelectedMethod] =
    useState<ParticipationMethod | null>(participation_method);
  const [showSurveyOptions, setShowSurveyOptions] = useState(false);
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
    // Before a new phase is saved, use ideation as a default
    // fallback config to control the radio behaviour.
    return 'ideation';
  };

  const isExistingProjectOrPhase =
    !isNilOrError(project) || !isNilOrError(phase?.data);

  const config = getMethodConfig(chooseParticipationMethod());

  const handleMethodSelect = (event, method: ParticipationMethod) => {
    event.preventDefault();
    const isSurveyCategory = ['native_survey', 'survey', 'poll'].includes(
      method
    );
    setShowSurveyOptions(isSurveyCategory);
    setSelectedMethod(method);
    handleParticipationMethodOnChange(method);
  };

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
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            <ParticipationMethodChoice
              key="ideation"
              title={formatMessage(messages2.ideationTitle)}
              subtitle={formatMessage(messages2.ideationDescription)}
              onClick={(event) => handleMethodSelect(event, 'ideation')}
              image={ideationImage}
              selected={selectedMethod === 'ideation'}
            />

            <ParticipationMethodChoice
              key="survey"
              title={formatMessage(messages2.surveyTitle)}
              subtitle={formatMessage(messages2.surveyDescription)}
              onClick={(event) => handleMethodSelect(event, 'native_survey')}
              image={surveyImage}
              selected={showSurveyOptions}
            />

            <ParticipationMethodChoice
              key="voting"
              title={formatMessage(messages2.votingTitle)}
              subtitle={formatMessage(messages2.votingDescription)}
              onClick={(event) => handleMethodSelect(event, 'voting')}
              image={votingImage}
              selected={selectedMethod === 'voting'}
            />

            <ParticipationMethodChoice
              key="information"
              title={formatMessage(messages2.informationTitle)}
              subtitle={formatMessage(messages2.informationDescription)}
              onClick={(event) => handleMethodSelect(event, 'information')}
              image={informationImage}
              selected={selectedMethod === 'information'}
            />

            {volunteeringEnabled && (
              <ParticipationMethodChoice
                key="volunteering"
                title={formatMessage(messages2.volunteeringTitle)}
                subtitle={formatMessage(messages2.volunteeringDescription)}
                onClick={(event) => handleMethodSelect(event, 'volunteering')}
                image={volunteeringImage}
                selected={selectedMethod === 'volunteering'}
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
                  <ParticipationMethodChoice
                    key="document"
                    title={formatMessage(messages2.documentTitle)}
                    subtitle={formatMessage(messages2.documentDescription)}
                    onClick={(event) => {
                      event.preventDefault();
                      if (documentAnnotationEnabled) {
                        handleMethodSelect(event, 'document_annotation');
                      }
                    }}
                    image={documentImage}
                    selected={selectedMethod === 'document_annotation'}
                  />
                </div>
              </Tippy>
            )}

            {showSurveyOptions && (
              <>
                <Box style={{ gridColumn: '1 / span 3' }}>
                  <SubSectionTitle>
                    {formatMessage(messages2.surveyOptions)}
                  </SubSectionTitle>
                </Box>

                {nativeSurveysEnabled && (
                  <ParticipationMethodChoice
                    onClick={(event) =>
                      handleMethodSelect(event, 'native_survey')
                    }
                    title={formatMessage(messages2.survey)}
                    selected={selectedMethod === 'native_survey'}
                  >
                    <>
                      <LeftAlignedList>
                        <li>
                          <FormattedMessage {...messages2.aiPoweredInsights} />
                        </li>
                        <li>
                          <FormattedMessage {...messages2.manyQuestionTypes} />
                        </li>
                        <li>
                          <FormattedMessage {...messages2.logic} />
                        </li>
                        <li>
                          <FormattedMessage
                            {...messages2.linkWithReportBuilder}
                          />
                        </li>
                      </LeftAlignedList>
                    </>
                  </ParticipationMethodChoice>
                )}

                {pollsEnabled && (
                  <ParticipationMethodChoice
                    onClick={(event) => handleMethodSelect(event, 'poll')}
                    title={formatMessage(messages2.quickPoll)}
                    selected={selectedMethod === 'poll'}
                  >
                    <>{formatMessage(messages2.quickPollDescription)}</>
                  </ParticipationMethodChoice>
                )}

                {showSurveys && (
                  <ParticipationMethodChoice
                    onClick={(event) => handleMethodSelect(event, 'survey')}
                    title={formatMessage(messages2.externalSurvey)}
                    selected={selectedMethod === 'survey'}
                  >
                    <>
                      <FormattedMessage {...messages2.embedSurvey} />
                      <LeftAlignedList>
                        <li>
                          <FormattedMessage {...messages2.lacksAIText} />
                        </li>
                        <li>
                          <FormattedMessage {...messages2.lacksReportingText} />
                        </li>
                      </LeftAlignedList>
                    </>
                  </ParticipationMethodChoice>
                )}
              </>
            )}
          </Box>
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
