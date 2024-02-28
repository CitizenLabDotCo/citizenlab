import React, { useState } from 'react';
import styled from 'styled-components';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import {
  IconTooltip,
  Text,
  Box,
  Badge,
  Icon,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';
import Tippy from '@tippyjs/react';
import ParticipationMethodChoice from './ParticipationMethodChoice';
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';

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
  const [methodToChangeTo, setMethodToChangeTo] =
    useState<ParticipationMethod | null>(null);
  const [showSurveyOptions, setShowSurveyOptions] = useState(false);
  const [showChangeMethodModal, setShowChangeMethodModal] = useState(false);
  const closeModal = () => {
    setShowChangeMethodModal(false);
  };
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
  const phaseReportsEnabled = useFeatureFlag({
    name: 'phase_reports',
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

  const changeMethod = (newMethod?: ParticipationMethod) => {
    const method = newMethod || methodToChangeTo;

    if (!method) {
      return;
    }

    const isSurveyCategory = ['native_survey', 'survey', 'poll'].includes(
      method
    );
    setShowSurveyOptions(isSurveyCategory);
    setSelectedMethod(method);
    handleParticipationMethodOnChange(method);
  };

  const handleMethodSelect = (event, method: ParticipationMethod) => {
    event.preventDefault();

    if (phase) {
      setMethodToChangeTo(method);
      setShowChangeMethodModal(true);
    } else {
      changeMethod(method);
    }
  };

  return (
    <>
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
                subtitle={formatMessage(messages2.votingDescription1)}
                onClick={(event) => handleMethodSelect(event, 'voting')}
                image={votingImage}
                selected={selectedMethod === 'voting'}
              />

              <ParticipationMethodChoice
                key="information"
                title={formatMessage(messages2.informationTitle)}
                subtitle={formatMessage(
                  phaseReportsEnabled
                    ? messages2.reportingDescription
                    : messages.shareInformationDescription
                )}
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
                <Box position="relative">
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
                  {/* Don't show tooltip and locked badge if the feature is enabled */}
                  {!documentAnnotationEnabled && (
                    <Box
                      style={{ transform: 'translateX(-50%)' }}
                      position="absolute"
                      top="20%"
                      left="50%"
                    >
                      <Tippy
                        maxWidth="250px"
                        placement="bottom"
                        content={formatMessage(
                          messages.contactGovSuccessToAccess
                        )}
                        hideOnClick={false}
                      >
                        <Badge color={colors.coolGrey600} className="inverse">
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            gap="6px"
                          >
                            <Icon name="lock" fill="white" width="13px" />
                            {formatMessage(messages2.addOn)}
                          </Box>
                        </Badge>
                      </Tippy>
                    </Box>
                  )}
                </Box>
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
                            <FormattedMessage
                              {...messages2.aiPoweredInsights}
                            />
                          </li>
                          <li>
                            <FormattedMessage
                              {...messages2.manyQuestionTypes}
                            />
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
                            <FormattedMessage
                              {...messages2.lacksReportingText}
                            />
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
      <Modal opened={showChangeMethodModal} close={closeModal}>
        <Box display="flex" flexDirection="column" width="100%" p="20px">
          <Box mb="40px">
            <Title variant="h3" color="primary">
              <FormattedMessage {...messages2.changingMethod} />
            </Title>
            <Text color="primary" fontSize="l">
              <FormattedMessage {...messages2.changeMethodWarning} />
            </Text>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            width="100%"
            alignItems="center"
          >
            <Button
              buttonStyle="secondary"
              width="100%"
              onClick={closeModal}
              mr="16px"
            >
              <FormattedMessage {...messages2.cancelMethodChange} />
            </Button>
            <Button
              buttonStyle="delete"
              width="100%"
              onClick={() => {
                changeMethod();
                closeModal();
              }}
            >
              <FormattedMessage {...messages2.confirmMethodChange} />
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ParticipationMethodPicker;
