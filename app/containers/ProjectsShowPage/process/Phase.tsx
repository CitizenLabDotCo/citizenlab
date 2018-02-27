import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';

// components
import ContentContainer from 'components/ContentContainer';
import Ideas from '../ideas/Ideas';
import Survey from './Survey';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { phaseStream, IPhase } from 'services/phases';

// i18n
import { getLocalized } from 'utils/i18n';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
// import { media } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';

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

type Props = {
  phaseId: string
};

type State = {
  locale: Locale | null;
  currentTenantLocales: Locale[] | null;
  phase: IPhase | null;
};

export default class Phase extends React.PureComponent<Props, State> {
  phaseId$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      locale: null,
      currentTenantLocales: null,
      phase: null
    };
    this.subscriptions = [];
    this.phaseId$ = new Rx.BehaviorSubject(null as any);
  }

  componentDidMount() {
    this.phaseId$.next(this.props.phaseId);

    this.subscriptions = [
      this.phaseId$.distinctUntilChanged().filter(phaseId => isString(phaseId)).switchMap((phaseId) => {
        const locale$ = localeStream().observable;
        const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => currentTenant.data.attributes.settings.core.locales);
        const phase$ = phaseStream(phaseId).observable;
        return Rx.Observable.combineLatest(locale$, currentTenantLocales$, phase$);
      }).subscribe(([locale, currentTenantLocales, phase]) => {
        this.setState({ locale, currentTenantLocales, phase });
      })
    ];
  }

  componentDidUpdate(_prevProps: Props) {
    this.phaseId$.next(this.props.phaseId);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const className = this.props['className'];
    const { locale, currentTenantLocales, phase } = this.state;

    if (locale && currentTenantLocales && phase) {
      const participationMethod = phase.data.attributes.participation_method;
      const description = getLocalized(phase.data.attributes.description_multiloc, locale, currentTenantLocales);

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
              <Ideas type="phase" id={phase.data.id} defaultDisplay={'card'} />
            </IdeasWrapper>
          }

          {participationMethod === 'survey' &&
            <Survey
              surveyId={phase.data.attributes.survey_id}
              surveyService={phase.data.attributes.survey_service}
            />
          }
        </StyledContentContainer>
      );
    }

    return null;
  }
}
