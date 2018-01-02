import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import 'moment-timezone';

// components
import Event from './Event';
import ContentContainer from 'components/ContentContainer';

// services
import { localeStream, updateLocale } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectBySlugStream, IProject } from 'services/projects';
import { eventsStream, IEvents } from 'services/events';
import { phasesStream, IPhases, IPhaseData } from 'services/phases';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { getLocalized } from 'utils/i18n';

// style
import styled, { css } from 'styled-components';
import { transparentize, lighten, darken } from 'polished';
import { media } from 'utils/styleUtils';

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  locale: string | null;
  currentTenant: ITenant | null;
  project: IProject | null;
  events: IEvents | null;
  loaded: boolean;
};

export default class events extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      project: null,
      events: null,
      loaded: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const project$ = projectBySlugStream(this.props.params.slug).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        project$
      ).switchMap(([locale, currentTenant, project]) => {
        const events$ = eventsStream(project.data.id).observable;
        return events$.map(events => ({ locale, currentTenant, project, events }));
      }).subscribe(({ locale, currentTenant, project, events }) => {
        this.setState({
          locale,
          currentTenant,
          project,
          events,
          loaded: true
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const className = this.props['className'];
    const { events, loaded } = this.state;

    if (loaded && events && events.data) {
      return (
        <ContentContainer className={className}>
          {events.data.map(event => <Event key={event.id} eventId={event.id} />)}
        </ContentContainer>
      );
    }

    return null;
  }
}
