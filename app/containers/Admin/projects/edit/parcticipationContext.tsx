import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// components
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Label from 'components/UI/Label';
import Select from 'components/UI/Select';
import Toggle from 'components/UI/Toggle';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

// services
import { projectByIdStream, IProject } from 'services/projects';
import { phaseStream, IPhase } from 'services/phases';
import eventEmitter from 'utils/eventEmitter';

// typings
import { IOption } from 'typings';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';

interface IParticipationContextConfig {
  participationMethod: 'information' | 'ideation' | null;
  postingEnabled: boolean;
  commentingEnabled: boolean;
  votingEnabled: boolean;
  votingMethod: 'unlimited' | 'limited' | null;
  votingLimit: number | null;
}

type Props = {
  type?: 'continuous' | 'timeline' | undefined;
  projectOrPhaseId?: string | undefined;
  onSubmit: (arg: IParticipationContextConfig) => void;
};

interface State extends IParticipationContextConfig {
  noParticipationMethod: JSX.Element | null;
  noVotingMethod: JSX.Element | null;
  noVotingLimit: JSX.Element | null;
}

class AdminProjectParticipationContext extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      participationMethod: null,
      postingEnabled: false,
      commentingEnabled: false,
      votingEnabled: false,
      votingMethod: null,
      votingLimit: 5,
      noParticipationMethod: null,
      noVotingMethod: null,
      noVotingLimit: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { projectOrPhaseId, type } = this.props;
    let parcticipationContext$: Rx.Observable<null | IProject | IPhase> = Rx.Observable.of(null);

    if (type && type === 'continuous' && projectOrPhaseId) {
      parcticipationContext$ = projectByIdStream(projectOrPhaseId).observable;
    } else if (type && type === 'timeline' && projectOrPhaseId) {
      parcticipationContext$ = projectByIdStream(projectOrPhaseId).observable;
    }

    this.subscriptions = [
      parcticipationContext$.subscribe((response) => {
        this.setState({
          participationMethod: (type ? (response as IProject | IPhase).data.attributes.participation_method : null),
          postingEnabled: (type ? (response as IProject | IPhase).data.attributes.posting_enabled : false),
          commentingEnabled: (type ? (response as IProject | IPhase).data.attributes.commenting_enabled : false),
          votingEnabled: (type ? (response as IProject | IPhase).data.attributes.voting_enabled : false),
          votingMethod: (type ? (response as IProject | IPhase).data.attributes.voting_method : null),
          votingLimit: (type ? (response as IProject | IPhase).data.attributes.voting_limited_max : 5)
        });
      }),

      eventEmitter.observeEvent('participationContextSubmit').subscribe(() => {
        if (this.validate()) {
          this.props.onSubmit({
            participationMethod: this.state.participationMethod,
            postingEnabled: this.state.postingEnabled,
            commentingEnabled: this.state.commentingEnabled,
            votingEnabled: this.state.votingEnabled,
            votingMethod: this.state.votingMethod,
            votingLimit: this.state.votingLimit
          });
        }
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleParticipationMethodOnChange = (selectedParticipationMethod: IOption) => {
    this.setState({ participationMethod: selectedParticipationMethod.value });
  }

  togglePostingEnabled = () => {
    this.setState((state: State) => ({ postingEnabled: !state.postingEnabled }));
  }

  toggleCommentingEnabled = () => {
    this.setState((state: State) => ({ commentingEnabled: !state.commentingEnabled }));
  }

  toggleVotingEnabled = () => {
    this.setState((state: State) => ({ votingEnabled: !state.votingEnabled }));
  }

  handeVotingMethodOnChange = (selectedVotingMethod: IOption) => {
    this.setState({ votingMethod: selectedVotingMethod.value });
  }

  validate() {
    let hasError = false;
    const { 
      participationMethod,
      postingEnabled,
      commentingEnabled,
      votingEnabled,
      votingMethod,
      votingLimit
    } = this.state;

    if (!participationMethod) {
      const noParticipationMethod = <FormattedMessage {...messages.noParticipationMethodErrorMessage} />;
      hasError = true;
    }

    if (!votingMethod) {
      const noVotingMethod = <FormattedMessage {...messages.noVotingMethodErrorMessage} />;
      hasError = true;
    }

    if (!votingLimit) {
      const noVotingLimit = <FormattedMessage {...messages.noVotingLimitErrorMessage} />;
      hasError = true;
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { 
      participationMethod,
      postingEnabled,
      commentingEnabled,
      votingEnabled,
      votingMethod,
      votingLimit,
      noParticipationMethod,
      noVotingMethod,
      noVotingLimit
    } = this.state;

    return (
      <Section>
        <SectionField>
          <Label>
            <FormattedMessage {...messages.participationMethod} />
          </Label>
          <Select
            placeholder={<FormattedMessage {...messages.participationMethodPlaceholder} />}
            value={participationMethod}
            onChange={this.handleParticipationMethodOnChange}
            clearable={false}
            options={[
              {
                value: 'information',
                label: formatMessage(messages.information)
              },
              {
                value: 'ideation',
                label: formatMessage(messages.ideation)
              },
            ]}
          />
          <Error text={noParticipationMethod} />
        </SectionField>

        <SectionField>
          <Label>
            <FormattedMessage {...messages.postingEnabled} />
          </Label>
          <Toggle checked={postingEnabled} onToggle={this.togglePostingEnabled} />
        </SectionField>

        <SectionField>
          <Label>
            <FormattedMessage {...messages.commentingEnabled} />
          </Label>
          <Toggle checked={commentingEnabled} onToggle={this.toggleCommentingEnabled} />
        </SectionField>

        <SectionField>
          <Label>
            <FormattedMessage {...messages.votingEnabled} />
          </Label>
          <Toggle checked={votingEnabled} onToggle={this.toggleVotingEnabled} />
        </SectionField>

        <SectionField>
          <Label>
            <FormattedMessage {...messages.votingMethod} />
          </Label>
          <Select
            placeholder={<FormattedMessage {...messages.votingMethodPlaceholder} />}
            value={votingMethod}
            onChange={this.handeVotingMethodOnChange}
            clearable={false}
            options={[
              {
                value: 'continuous',
                label: formatMessage(messages.continuous)
              },
              {
                value: 'timeline',
                label: formatMessage(messages.timeline)
              },
            ]}
          />
          <Error text={noVotingMethod} />
        </SectionField>
      </Section>
    );

    // return null;
  }
}

export default injectIntl<Props>(AdminProjectParticipationContext);
