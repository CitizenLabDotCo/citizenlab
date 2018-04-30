import React from 'react';
import { adopt } from 'react-adopt';

// components
import ContentContainer from 'components/ContentContainer';
import Survey from './survey';
import IdeaCards from 'components/IdeaCards';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// i18n
import { getLocalized } from 'utils/i18n';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';

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
  font-size: 18px;
  line-height: 28px;
  font-weight: 300;

  strong {
    font-weight: 500;
  }
`;

const IdeasWrapper = styled.div`
  margin-top: 60px;
`;

interface InputProps {
  phaseId: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Phase extends React.PureComponent<Props, State> {
  render() {
    const className = this.props['className'];
    const { locale, tenantLocales, phase } = this.props;

    if (locale && tenantLocales && phase) {
      const participationMethod = phase.attributes.participation_method;
      const description = getLocalized(phase.attributes.description_multiloc, locale, tenantLocales);
      return (
        <StyledContentContainer className={className}>
          {(description && description.length > 0) &&
            <Information>
              <InformationTitle>
                <FormattedMessage {...messages.aboutThisPhase} />
              </InformationTitle>
              <InformationBody>
                <span dangerouslySetInnerHTML={{ __html: description }} />
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
  locale: <GetLocale/>,
  tenantLocales: <GetTenantLocales/>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <Phase {...inputProps} {...dataProps} />}
  </Data>
);
