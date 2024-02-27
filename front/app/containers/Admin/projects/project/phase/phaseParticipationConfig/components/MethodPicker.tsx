import React, { useState } from 'react';
import {
  Box,
  IconTooltip,
  Toggle,
  colors,
  Title,
  BoxProps,
  Icon,
  Text,
  Image,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import ParticipationMethodChoice from './ParticipationMethodChoice';
import ideationImage from './ideation.png';
import surveyImage from './survey.png';
import votingImage from './voting.png';
import informationImage from './information.png';
import volunteeringImage from './volunteering.png';
import documentImage from './document.png';
import messages from './messages';

type MethodOption =
  | 'ideation'
  | 'survey'
  | 'voting'
  | 'information'
  | 'volunteering'
  | 'document';

const MethodPicker = () => {
  const [selectedMethod, setSelectedMethod] = useState<MethodOption | null>(
    null
  );
  const { formatMessage } = useIntl();

  const handleMethodSelect = (event, method: MethodOption) => {
    event.preventDefault();
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
      onClick: (event) => handleMethodSelect(event, 'survey'),
      image: surveyImage,
      selected: selectedMethod === 'survey',
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
      onClick: (event) => handleMethodSelect(event, 'document'),
      image: documentImage,
      selected: selectedMethod === 'document',
    },
  ];

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
      }}
      mb="32px"
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
    </Box>
  );
};

export default MethodPicker;
