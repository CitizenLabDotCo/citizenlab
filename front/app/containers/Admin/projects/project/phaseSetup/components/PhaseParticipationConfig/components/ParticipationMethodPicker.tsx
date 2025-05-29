import React, { useState, useEffect } from 'react';

import {
  IconTooltip,
  Text,
  Box,
  Badge,
  Icon,
  Title,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { CLErrors } from 'typings';

import { IPhase, ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Button from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../../../messages';

import commonGroundImage from './assets/common_ground.png';
import documentImage from './assets/document.png';
import ideationImage from './assets/ideation.png';
import informationImage from './assets/information.png';
import proposalsImage from './assets/proposals.png';
import surveyImage from './assets/survey.png';
import volunteeringImage from './assets/volunteering.png';
import votingImage from './assets/voting.png';
import messages2 from './messages';
import ParticipationMethodChoice, {
  ChildText,
} from './ParticipationMethodChoice';

const LeftAlignedList = styled.ul`
  text-align: left;
`;

const ParticipationMethodDescriptionWrapper = styled.div<{ selected: boolean }>`
  width: 100%;
  color: ${({ selected }) => (selected ? colors.primary : colors.coolGrey500)};

  overflow-wrap: break-word;
  word-wrap: break-word;
  text-align: left;
  line-height: 21px;
`;

interface Props {
  participation_method: ParticipationMethod;
  phase?: IPhase | undefined | null;
  showSurveys: boolean;
  apiErrors: CLErrors | null | undefined;
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
    participation_method === 'native_survey' ||
      participation_method === 'survey' ||
      participation_method === 'poll'
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

  useEffect(() => {
    setSelectedMethod(participation_method);
    setShowSurveyOptions(
      participation_method === 'native_survey' ||
        participation_method === 'survey' ||
        participation_method === 'poll'
    );
  }, [participation_method]);

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

    // We don't want to change the method if it is the same
    if (selectedMethod === method) {
      return;
    }

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
        <SubSectionTitle className="intercom-admin-participation-method-picker-heading">
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
              participation_method="ideation"
            />

            <ParticipationMethodChoice
              key="proposals"
              title={formatMessage(messages2.proposalsTitle)}
              subtitle={formatMessage(messages2.proposalsDescription)}
              onClick={(event) => handleMethodSelect(event, 'proposals')}
              image={proposalsImage}
              selected={selectedMethod === 'proposals'}
              participation_method="proposals"
            />

            <Box position="relative">
              <ParticipationMethodChoice
                key="common_ground"
                title={formatMessage(messages2.commonGroundTitle)}
                subtitle={formatMessage(messages2.commonGroundDescription)}
                onClick={(event) => handleMethodSelect(event, 'common_ground')}
                image={commonGroundImage}
                selected={selectedMethod === 'common_ground'}
                participation_method="common_ground"
              />
              <Box
                style={{ transform: 'translateX(-50%)' }}
                position="absolute"
                top="10%"
                left="50%"
              >
                <Tooltip
                  maxWidth="500px"
                  placement="bottom"
                  content={formatMessage(messages.betaTooltip)}
                  hideOnClick={false}
                >
                  <Badge color={colors.coolGrey600} className="inverse">
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      gap="6px"
                    >
                      {formatMessage(messages.beta)}
                    </Box>
                  </Badge>
                </Tooltip>
              </Box>
            </Box>

            <ParticipationMethodChoice
              key="survey"
              title={formatMessage(messages2.surveyTitle)}
              subtitle={formatMessage(messages2.surveyDescription)}
              onClick={(event) => handleMethodSelect(event, 'native_survey')}
              image={surveyImage}
              selected={showSurveyOptions}
              participation_method="native_survey"
            />

            <ParticipationMethodChoice
              key="voting"
              title={formatMessage(messages2.votingTitle)}
              subtitle={formatMessage(messages2.votingDescription)}
              onClick={(event) => handleMethodSelect(event, 'voting')}
              image={votingImage}
              selected={selectedMethod === 'voting'}
              participation_method="voting"
            />

            <ParticipationMethodChoice
              key="information"
              title={formatMessage(messages2.informationTitle)}
              subtitle={formatMessage(messages2.reportingDescription)}
              onClick={(event) => handleMethodSelect(event, 'information')}
              image={informationImage}
              selected={selectedMethod === 'information'}
              participation_method="information"
            />

            <ParticipationMethodChoice
              key="volunteering"
              title={formatMessage(messages2.volunteeringTitle)}
              subtitle={formatMessage(messages2.volunteeringDescription)}
              onClick={(event) => handleMethodSelect(event, 'volunteering')}
              image={volunteeringImage}
              selected={selectedMethod === 'volunteering'}
              participation_method="volunteering"
            />
            {documentAnnotationAllowed ? (
              documentAnnotationEnabled && (
                <Box position="relative">
                  <ParticipationMethodChoice
                    key="document"
                    title={formatMessage(messages2.documentTitle)}
                    subtitle={formatMessage(messages2.documentDescription)}
                    onClick={(event) => {
                      event.preventDefault();
                      handleMethodSelect(event, 'document_annotation');
                    }}
                    image={documentImage}
                    selected={selectedMethod === 'document_annotation'}
                    participation_method="document_annotation"
                  />
                </Box>
              )
            ) : (
              <Box position="relative">
                <ParticipationMethodChoice
                  key="document"
                  title={formatMessage(messages2.documentTitle)}
                  subtitle={formatMessage(messages2.documentDescription)}
                  image={documentImage}
                  selected={selectedMethod === 'document_annotation'}
                  participation_method="document_annotation"
                />
                <Box
                  style={{ transform: 'translateX(-50%)' }}
                  position="absolute"
                  top="20%"
                  left="50%"
                >
                  <Tooltip
                    maxWidth="250px"
                    placement="bottom"
                    content={formatMessage(messages.contactGovSuccessToAccess)}
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
                  </Tooltip>
                </Box>
              </Box>
            )}

            {showSurveyOptions && (
              <>
                <Box style={{ gridColumn: '1 / span 3' }}>
                  <SubSectionTitle>
                    {formatMessage(messages2.surveyOptions)}
                  </SubSectionTitle>
                </Box>

                <ParticipationMethodChoice
                  onClick={(event) =>
                    handleMethodSelect(event, 'native_survey')
                  }
                  title={formatMessage(messages2.survey)}
                  selected={selectedMethod === 'native_survey'}
                  key="native_survey"
                  participation_method="native_survey"
                >
                  <ParticipationMethodDescriptionWrapper
                    selected={selectedMethod === 'native_survey'}
                  >
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
                  </ParticipationMethodDescriptionWrapper>
                </ParticipationMethodChoice>

                {pollsEnabled && (
                  <ParticipationMethodChoice
                    onClick={(event) => handleMethodSelect(event, 'poll')}
                    title={formatMessage(messages2.quickPoll)}
                    selected={selectedMethod === 'poll'}
                    participation_method="poll"
                  >
                    <ChildText selected={selectedMethod === 'poll'}>
                      {formatMessage(messages2.quickPollDescription)}
                    </ChildText>
                  </ParticipationMethodChoice>
                )}

                {showSurveys && (
                  <ParticipationMethodChoice
                    onClick={(event) => handleMethodSelect(event, 'survey')}
                    title={formatMessage(messages2.externalSurvey)}
                    selected={selectedMethod === 'survey'}
                    participation_method="survey"
                  >
                    <ParticipationMethodDescriptionWrapper
                      selected={selectedMethod === 'survey'}
                    >
                      <FormattedMessage {...messages2.embedSurvey} />
                      <LeftAlignedList>
                        <li>
                          <FormattedMessage {...messages2.lacksAIText} />
                        </li>
                        <li>
                          <FormattedMessage {...messages2.lacksReportingText} />
                        </li>
                      </LeftAlignedList>
                    </ParticipationMethodDescriptionWrapper>
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
