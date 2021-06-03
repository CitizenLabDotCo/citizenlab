import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  IInsightsInputData,
  deleteInsightsInputCategory,
} from 'modules/commercial/insights/services/insightsInputs';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// components
import T from 'components/T';

// hooks
import useIdea from 'hooks/useIdea';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

type InputDetailsProps = {
  inputs: IInsightsInputData[];
  selectedInput: IInsightsInputData;
} & WithRouterProps &
  InjectedIntlProps;

const Container = styled.div`
  padding: 48px;
`;

const IdeaTitle = styled.h1`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.xl}px;
  margin-bottom: 24px;
`;

const IdeaBody = styled.div`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
`;

const InputDetails = ({ inputs, selectedInput }: InputDetailsProps) => {
  const idea = useIdea({ ideaId: selectedInput.relationships?.source.data.id });
  if (isNilOrError(idea)) {
    return null;
  }

  return (
    <Container>
      <IdeaTitle>
        <T value={idea.attributes.title_multiloc} supportHtml />
      </IdeaTitle>
      <IdeaBody>
        <T value={idea.attributes.body_multiloc} supportHtml />
      </IdeaBody>
    </Container>
  );
};

export default withRouter(injectIntl(InputDetails));
