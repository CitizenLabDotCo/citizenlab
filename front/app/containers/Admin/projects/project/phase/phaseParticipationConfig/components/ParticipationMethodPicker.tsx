import React, { useEffect, useState } from 'react';

import {
  IconTooltip,
  Text,
  Box,
  Badge,
  Icon,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';

import { IPhase, ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { ApiErrors } from '..';
import messages from '../../../messages';

import documentImage from './assets/document.png';
import ideationImage from './assets/ideation.png';
import informationImage from './assets/information.png';
import surveyImage from './assets/survey.png';
import volunteeringImage from './assets/volunteering.png';
import votingImage from './assets/voting.png';
import messages2 from './messages';
import ParticipationMethodChoice from './ParticipationMethodChoice';

const LeftAlignedList = styled.ul`
  text-align: left;
`;

interface Props {
  participation_method: ParticipationMethod;
  phase?: IPhase | undefined | null;
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
  handleParticipationMethodOnChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const [selectedMethod, setSelectedMethod] =
    useState<ParticipationMethod | null>(participation_method);
  const [methodToChangeTo, setMethodToChangeTo] =
    useState<ParticipationMethod | null>(null);
  const [showSurveyOptions, setShowSurveyOptions] = useState(
    selectedMethod === 'native_survey'
  );
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

  useEffect(() => {
    setSelectedMethod(participation_method);
    setShowSurveyOptions(participation_method === 'native_survey');
  }, [participation_method]);

  return (
    <>
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.participationMethodTitleText} />
          <IconTooltip
            content={
              <FormattedMessage {...messages.participationMethodTooltip} />
            }
          />
        </SubSectionTitle>
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
              subtitle={formatMessage(messages2.reportingDescription)}
              onClick={(event) => handleMethodSelect(event, 'information')}
              image={informationImage}
              selected={selectedMethod === 'information'}
            />

            <ParticipationMethodChoice
              key="volunteering"
              title={formatMessage(messages2.volunteeringTitle)}
              subtitle={formatMessage(messages2.volunteeringDescription)}
              onClick={(event) => handleMethodSelect(event, 'volunteering')}
              image={volunteeringImage}
              selected={selectedMethod === 'volunteering'}
            />

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
              buttonStyle="secondary-outlined"
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
