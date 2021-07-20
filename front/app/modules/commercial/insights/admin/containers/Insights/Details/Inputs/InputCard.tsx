import React from 'react';
import styled from 'styled-components';
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';
import { colors, fontSizes } from 'utils/styleUtils';
import Button from 'components/UI/Button';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import T from 'components/T';

// hooks
import useIdea from 'hooks/useIdea';

type InputCardProps = { input: IInsightsInputData } & InjectedIntlProps;

const Container = styled.div`
  border-radius: 3px;
  background-color: #fff;
  border: 1px solid ${colors.separation};
  padding: 12px 28px;
  margin-bottom: 8px;
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

const InputCard = ({ input, intl: { formatMessage } }: InputCardProps) => {
  const idea = useIdea({ ideaId: input.relationships?.source.data.id });

  if (isNilOrError(idea)) {
    return null;
  }
  return (
    <Container>
      <InputTitle>
        <T value={idea.attributes.title_multiloc} />
      </InputTitle>
      <InputBody>
        <T value={idea.attributes.body_multiloc} supportHtml maxLength={200} />
      </InputBody>
      <div style={{ display: 'flex' }}>
        <Button
          buttonStyle="text"
          fontWeight="bold"
          padding="0px"
          fontSize={`${fontSizes.small}px`}
        >
          {formatMessage(messages.inputsReadMore)}
        </Button>
      </div>
    </Container>
  );
};

export default injectIntl(InputCard);
