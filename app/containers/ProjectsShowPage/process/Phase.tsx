import React from 'react';
import { every, isEmpty } from 'lodash';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import Survey from './survey';
import IdeaCards from 'components/IdeaCards';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { quillEditedContent, fontSizes } from 'utils/styleUtils';
import T from 'components/T';

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 70px;
`;

const Information = styled.div`
  margin-top: 45px;
  margin-bottom: 20px;
`;

const InformationTitle = styled.h2`
  color: #333;
  font-size: 21px;
  font-weight: 600;
`;

const InformationBody = styled.div`
  color: #333;
  font-size: ${fontSizes.large}px;
  line-height: 28px;
  font-weight: 300;

  strong {
    font-weight: 500;
  }

  ${quillEditedContent()}
`;

const IdeasWrapper = styled.div`
  margin-top: 60px;
`;

interface InputProps {
  phaseId: string;
}

interface DataProps {
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Phase extends React.PureComponent<Props, State> {
  render() {
    const className = this.props['className'];
    const { phase } = this.props;

    if (!isNilOrError(phase)) {
      const participationMethod = phase.attributes.participation_method;
      const hasDescription = !every(phase.attributes.description_multiloc, isEmpty);
      return (
        <StyledContentContainer className={className}>
          {hasDescription &&
            <Information>
              <InformationTitle>
                <FormattedMessage {...messages.aboutThisPhase} />
              </InformationTitle>
              <InformationBody>
                <T value={phase.attributes.description_multiloc} supportHtml={true} />
              </InformationBody>
            </Information>
          }

          {participationMethod === 'ideation' &&
            <IdeasWrapper>
              <IdeaCards
                type="load-more"
                sort={'trending'}
                pageSize={12}
                phaseId={phase.id}
                showViewToggle={true}
                defaultView={phase.attributes.presentation_mode}
              />
            </IdeasWrapper>
          }

          {participationMethod === 'survey' &&
            <Survey
              surveyEmbedUrl={phase.attributes.survey_embed_url}
              surveyService={phase.attributes.survey_service}
            />
          }
        </StyledContentContainer>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <Phase {...inputProps} {...dataProps} />}
  </Data>
);
