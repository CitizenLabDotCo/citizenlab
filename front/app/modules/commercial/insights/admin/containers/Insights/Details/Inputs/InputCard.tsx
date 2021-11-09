import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import T from 'components/T';
import Button from 'components/UI/Button';

// hooks
import useIdea from 'hooks/useIdea';

// types
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';

const InputTitle = styled.h2`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 12px;
`;

const InputBody = styled.div`
  color: ${colors.label};
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  span,
  strong,
  em {
    font-size: ${fontSizes.small}px;
    font-style: normal;
    font-weight: 500;
  }
`;

type InputCardProps = {
  onPreview: (input: IInsightsInputData) => void;
  input: IInsightsInputData;
} & WithRouterProps;

const InputCard = ({
  input,
  location: { query },
  onPreview,
}: InputCardProps) => {
  const idea = useIdea({ ideaId: input.relationships?.source.data.id });

  if (isNilOrError(idea)) {
    return null;
  }

  const handleReadMoreClick = () => {
    onPreview(input);
  };

  return (
    <Button
      data-testid="insightsInputCard"
      onClick={handleReadMoreClick}
      buttonStyle={
        query.previewedInputId === idea.id ? 'secondary-outlined' : 'white'
      }
      mb="8px"
      p="12px 28px"
      whiteSpace="wrap"
      bgColor="white"
      bgHoverColor="white"
    >
      <InputTitle>
        <T value={idea.attributes.title_multiloc} />
      </InputTitle>
      <InputBody>
        <T value={idea.attributes.body_multiloc} supportHtml maxLength={200} />
      </InputBody>
    </Button>
  );
};

export default withRouter(InputCard);
