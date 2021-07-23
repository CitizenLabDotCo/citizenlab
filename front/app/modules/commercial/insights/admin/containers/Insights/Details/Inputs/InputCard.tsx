import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import T from 'components/T';
import Button from 'components/UI/Button';

// hooks
import useIdea from 'hooks/useIdea';

// types
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';

const Container = styled.div<{ isActive: boolean }>`
  border-radius: 3px;
  background-color: #fff;
  border: 1px solid
    ${({ isActive }) => (isActive ? colors.border : colors.separation)};
  padding: 12px 28px;
  margin-bottom: 8px;
  .buttonContainer {
    display: flex;
  }
`;

const InputTitle = styled.h2`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 12px;
`;

const InputBody = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
`;

type InputCardProps = {
  onReadMore: (input: IInsightsInputData) => void;
  input: IInsightsInputData;
} & InjectedIntlProps &
  WithRouterProps;

const InputCard = ({
  input,
  intl: { formatMessage },
  location: { query },
  onReadMore,
}: InputCardProps) => {
  const idea = useIdea({ ideaId: input.relationships?.source.data.id });

  if (isNilOrError(idea)) {
    return null;
  }

  const handleReadMoreClick = () => {
    onReadMore(input);
  };

  return (
    <Container
      data-testid="insightsInputCard"
      isActive={query.previewedInputId === idea.id}
    >
      <InputTitle>
        <T value={idea.attributes.title_multiloc} />
      </InputTitle>
      <InputBody>
        <T value={idea.attributes.body_multiloc} supportHtml maxLength={200} />
      </InputBody>
      <div className="buttonContainer">
        <Button
          buttonStyle="text"
          fontWeight="bold"
          padding="0px"
          fontSize={`${fontSizes.small}px`}
          onClick={handleReadMoreClick}
        >
          {formatMessage(messages.inputsReadMore)}
        </Button>
      </div>
    </Container>
  );
};

export default withRouter(injectIntl(InputCard));
