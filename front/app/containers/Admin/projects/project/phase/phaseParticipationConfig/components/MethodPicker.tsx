import React, { useState } from 'react';
import { Box, Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import ParticipationMethodChoice from './ParticipationMethodChoice';
import ideationImage from './assets/ideation.png';
import surveyImage from './assets/survey.png';
import votingImage from './assets/voting.png';
import informationImage from './assets/information.png';
import volunteeringImage from './assets/volunteering.png';
import documentImage from './assets/document.png';
import messages from './messages';
import { ParticipationMethod } from 'api/phases/types';

const LeftAlignedList = styled.ul`
  text-align: left;
`;

const MethodPicker = () => {
  const [selectedMethod, setSelectedMethod] =
    useState<ParticipationMethod | null>(null);
  const [showSurveyOptions, setShowSurveyOptions] = useState(false);
  const { formatMessage } = useIntl();

  const handleMethodSelect = (event, method: ParticipationMethod) => {
    event.preventDefault();
    const isSurveyCategory = ['native_survey', 'survey', 'poll'].includes(
      method
    );
    setShowSurveyOptions(isSurveyCategory);
    setSelectedMethod(method);
  };

  const methodData = [
    {
      title: formatMessage(messages.ideationTitle),
      subtitle: formatMessage(messages.ideationDescription),
      onClick: (event) => handleMethodSelect(event, 'ideation'),
      image: ideationImage,
      selected: selectedMethod === 'ideation',
    },
    {
      title: formatMessage(messages.surveyTitle),
      subtitle: formatMessage(messages.surveyDescription),
      onClick: (event) => {
        event.preventDefault();
        setShowSurveyOptions(true);
        setSelectedMethod(null);
      },
      image: surveyImage,
      selected: showSurveyOptions,
    },
    {
      title: formatMessage(messages.votingTitle),
      subtitle: formatMessage(messages.votingDescription),
      onClick: (event) => handleMethodSelect(event, 'voting'),
      image: votingImage,
      selected: selectedMethod === 'voting',
    },
    {
      title: formatMessage(messages.informationTitle),
      subtitle: formatMessage(messages.informationDescription),
      onClick: (event) => handleMethodSelect(event, 'information'),
      image: informationImage,
      selected: selectedMethod === 'information',
    },
    {
      title: formatMessage(messages.volunteeringTitle),
      subtitle: formatMessage(messages.volunteeringDescription),
      onClick: (event) => handleMethodSelect(event, 'volunteering'),
      image: volunteeringImage,
      selected: selectedMethod === 'volunteering',
    },
    {
      title: formatMessage(messages.documentTitle),
      subtitle: formatMessage(messages.documentDescription),
      onClick: (event) => handleMethodSelect(event, 'document_annotation'),
      image: documentImage,
      selected: selectedMethod === 'document_annotation',
    },
  ];

  return (
    <Box mb="32px">
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
        my="32px"
      >
        {methodData.map((method, index) => (
          <ParticipationMethodChoice
            key={index}
            title={method.title}
            subtitle={method.subtitle}
            onClick={method.onClick}
            image={method.image}
            selected={method.selected}
          />
        ))}

        {showSurveyOptions && (
          <>
            <Box style={{ gridColumn: '1 / span 3' }}>
              <Title my="0px" variant="h6" color="primary" textAlign="left">
                {formatMessage(messages.surveyOptions)}
              </Title>
            </Box>

            <ParticipationMethodChoice
              onClick={(event) => handleMethodSelect(event, 'native_survey')}
              title={formatMessage(messages.survey)}
              selected={selectedMethod === 'native_survey'}
            >
              <>
                <LeftAlignedList>
                  <li>
                    <FormattedMessage {...messages.aiPoweredInsights} />
                  </li>
                  <li>
                    <FormattedMessage {...messages.manyQuestionTypes} />
                  </li>
                  <li>
                    <FormattedMessage {...messages.logic} />
                  </li>
                  <li>
                    <FormattedMessage {...messages.linkWithReportBuilder} />
                  </li>
                </LeftAlignedList>
              </>
            </ParticipationMethodChoice>

            <ParticipationMethodChoice
              onClick={(event) => handleMethodSelect(event, 'poll')}
              title={formatMessage(messages.quickPoll)}
              selected={selectedMethod === 'poll'}
            >
              <>{formatMessage(messages.quickPollDescription)}</>
            </ParticipationMethodChoice>

            <ParticipationMethodChoice
              onClick={(event) => handleMethodSelect(event, 'survey')}
              title={formatMessage(messages.externalSurvey)}
              selected={selectedMethod === 'survey'}
            >
              <>
                <FormattedMessage {...messages.embedSurvey} />
                <LeftAlignedList>
                  <li>
                    <FormattedMessage {...messages.lacksAIText} />
                  </li>
                  <li>
                    <FormattedMessage {...messages.lacksReportingText} />
                  </li>
                </LeftAlignedList>
              </>
            </ParticipationMethodChoice>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MethodPicker;
