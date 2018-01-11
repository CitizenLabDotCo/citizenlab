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

const VotingMethodSectionField = styled(SectionField)`
  display: flex;
  flex-direction: row;
`;

const ToggleSectionField = styled(SectionField)`
  display: flex;
  flex-direction: row;
`;

const ToggleLabel = styled(Label)`
  color: #333;
  width: 100%;
  max-width: 300px;
`;

const VotingMethodSelect = styled(Select)`
  width: 350px !important;
  margin-right: 20px !important;
`;

const VotingLimitInput = styled(Input)`
  width: 100px;
  height: 46px !important;
`;

export interface IParticipationContextConfig {
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

class ParticipationContext extends React.PureComponent<Props & InjectedIntlProps, State> {
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
          participationMethod: (projectOrPhaseId ? (response as IProject | IPhase).data.attributes.participation_method : null),
          postingEnabled: (projectOrPhaseId ? (response as IProject | IPhase).data.attributes.posting_enabled : false),
          commentingEnabled: (projectOrPhaseId ? (response as IProject | IPhase).data.attributes.commenting_enabled : false),
          votingEnabled: (projectOrPhaseId ? (response as IProject | IPhase).data.attributes.voting_enabled : false),
          votingMethod: (projectOrPhaseId ? (response as IProject | IPhase).data.attributes.voting_method : null),
          votingLimit: (projectOrPhaseId ? (response as IProject | IPhase).data.attributes.voting_limited_max : 5)
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
    this.setState({ participationMethod: selectedParticipationMethod.value, noParticipationMethod: null });
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
    this.setState({ votingMethod: selectedVotingMethod.value, noVotingMethod: null });
  }

  handleVotingLimitOnChange = (votingLimit: string) => {
    this.setState({ votingLimit: parseInt(votingLimit, 10) });
  }

  validate() {
    let hasError = false;
    let noParticipationMethod: JSX.Element | null = null;
    let noVotingMethod: JSX.Element | null = null;
    let noVotingLimit: JSX.Element | null = null;
    const { 
      participationMethod,
      // postingEnabled,
      // commentingEnabled,
      // votingEnabled,
      votingMethod,
      votingLimit
    } = this.state;

    if (!participationMethod) {
      noParticipationMethod = <FormattedMessage {...messages.noParticipationMethodErrorMessage} />;
      hasError = true;
    }

    if (!votingMethod) {
      noVotingMethod = <FormattedMessage {...messages.noVotingMethodErrorMessage} />;
      hasError = true;
    }

    if (!votingLimit) {
      noVotingLimit = <FormattedMessage {...messages.noVotingLimitErrorMessage} />;
      hasError = true;
    }

    this.setState({ noParticipationMethod, noVotingMethod, noVotingLimit });

    return !hasError;
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

        <VotingMethodSectionField>
          <div>
            <Label>
              <FormattedMessage {...messages.votingMethod} />
            </Label>
            <VotingMethodSelect
              placeholder={<FormattedMessage {...messages.votingMethodPlaceholder} />}
              value={votingMethod}
              onChange={this.handeVotingMethodOnChange}
              clearable={false}
              options={[
                {
                  value: 'unlimited',
                  label: formatMessage(messages.unlimited)
                },
                {
                  value: 'limited',
                  label: formatMessage(messages.limited)
                },
              ]}
            />
            <Error text={noVotingMethod} />
          </div>

          {votingMethod === 'limited' &&
            <div>
              <Label htmlFor="voting-title">
                <FormattedMessage {...messages.votingLimit} />
              </Label>
              <VotingLimitInput
                id="voting-limit"
                type="number"
                placeholder=""
                value={(votingLimit ? votingLimit.toString() : null)}
                error={noVotingLimit}
                onChange={this.handleVotingLimitOnChange}
              />
              {/* <Error fieldName="title_multiloc" apiErrors={this.state.apiErrors.title_multiloc} /> */}
            </div>
          }
        </VotingMethodSectionField>

        <ToggleSectionField>
          <ToggleLabel>
            <FormattedMessage {...messages.postingEnabled} />
          </ToggleLabel>
          <Toggle checked={postingEnabled} onToggle={this.togglePostingEnabled} />
        </ToggleSectionField>

        <ToggleSectionField>
          <ToggleLabel>
            <FormattedMessage {...messages.commentingEnabled} />
          </ToggleLabel>
          <Toggle checked={commentingEnabled} onToggle={this.toggleCommentingEnabled} />
        </ToggleSectionField>

        <ToggleSectionField>
          <ToggleLabel>
            <FormattedMessage {...messages.votingEnabled} />
          </ToggleLabel>
          <Toggle checked={votingEnabled} onToggle={this.toggleVotingEnabled} />
        </ToggleSectionField>

      </Section>
    );

    // return null;
  }
}

export default injectIntl<Props>(ParticipationContext);
