import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isNumber } from 'lodash';

// components
import Input from 'components/UI/Input';
import Error from 'components/UI/Error';
import Label from 'components/UI/Label';
import Radio from 'components/UI/Radio';
import Toggle from 'components/UI/Toggle';
import { Section, SectionField } from 'components/admin/Section';

// services
import { projectByIdStream, IProject } from 'services/projects';
import { phaseStream, IPhase } from 'services/phases';
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';

const Container = styled.div``;

const StyledSection = styled(Section)`
  margin-bottom: 0;
`;

const StyledSectionField = styled(SectionField)`
  margin-bottom: 0;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const ToggleRow = Row.extend`
  margin-bottom: 10px;
`;

const ToggleLabel = styled(Label)`
  width: 100%;
  max-width: 300px;
  color: #333;
  font-size: 16px;
  font-weight: 400;
`;

const VotingLimitInput = styled(Input)`
  width: 100px;
  height: 46px !important;
`;

export interface IParticipationContextConfig {
  participationMethod: 'ideation' | 'information';
  postingEnabled: boolean;
  commentingEnabled: boolean;
  votingEnabled: boolean;
  votingMethod: 'unlimited' | 'limited';
  votingLimit: number | null;
}

type Props = {
  type?: 'continuous' | 'timeline' | undefined;
  projectOrPhaseId?: string | undefined;
  onSubmit: (arg: IParticipationContextConfig) => void;
};

interface State extends IParticipationContextConfig {
  noVotingLimit: JSX.Element | null;
  loaded: boolean;
}

export default class ParticipationContext extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      participationMethod: 'ideation',
      postingEnabled: true,
      commentingEnabled: true,
      votingEnabled: true,
      votingMethod: 'unlimited',
      votingLimit: 5,
      noVotingLimit: null,
      loaded: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { projectOrPhaseId, type } = this.props;
    let parcticipationContext$: Rx.Observable<null | IProject | IPhase> = Rx.Observable.of(null);

    if (type && type === 'continuous' && projectOrPhaseId) {
      parcticipationContext$ = phaseStream(projectOrPhaseId).observable;
    } else if (type && type === 'timeline' && projectOrPhaseId) {
      parcticipationContext$ = projectByIdStream(projectOrPhaseId).observable;
    }

    this.subscriptions = [
      parcticipationContext$.subscribe((response) => {
        if (projectOrPhaseId && response) {
          const {
            participation_method,
            posting_enabled,
            commenting_enabled,
            voting_enabled,
            voting_method,
            voting_limited_max
          } = response.data.attributes;

          this.setState({
            participationMethod: participation_method,
            postingEnabled: posting_enabled,
            commentingEnabled: commenting_enabled,
            votingEnabled: voting_enabled,
            votingMethod: voting_method,
            votingLimit: voting_limited_max,
            loaded: true
          });
        } else {
          this.setState({ loaded: true });
        }
      }),

      eventEmitter.observeEventFromSource('AdminProjectEditGeneral', 'AdminProjectEditGeneralSubmitEvent').subscribe(() => {
        if (this.validate()) {
          const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit } = this.state;
          this.props.onSubmit({ participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit });
        }
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleParticipationMethodOnChange = (participationMethod: 'ideation' | 'information') => {
    this.setState({ participationMethod });
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

  handeVotingMethodOnChange = (votingMethod: 'unlimited' | 'limited') => {
    this.setState({ votingMethod });
  }

  handleVotingLimitOnChange = (votingLimit: string) => {
    this.setState({ votingLimit: parseInt(votingLimit, 10) });
  }

  validate() {
    let hasError = false;
    let noVotingLimit: JSX.Element | null = null;
    const { votingMethod, votingLimit } = this.state;

    if (votingMethod === 'limited' && (!isNumber(votingLimit) || votingLimit < 1)) {
      noVotingLimit = <FormattedMessage {...messages.noVotingLimitErrorMessage} />;
      hasError = true;
    }

    this.setState({ noVotingLimit });

    return !hasError;
  }

  render() {
    const className = this.props['className'];
    const { 
      participationMethod,
      postingEnabled,
      commentingEnabled,
      votingEnabled,
      votingMethod,
      votingLimit,
      noVotingLimit,
      loaded
    } = this.state;

    if (loaded) {
      return (
        <Container className={className}>
          <StyledSection>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.participationMethod} />
              </Label>
              <Radio
                onChange={this.handleParticipationMethodOnChange}
                currentValue={participationMethod}
                value="ideation"
                name="participationmethod"
                id="participationmethod-ideation"
                label={<FormattedMessage {...messages.ideation} />}
              />
              <Radio
                onChange={this.handleParticipationMethodOnChange}
                currentValue={participationMethod}
                value="information"
                name="participationmethod"
                id="participationmethod-information"
                label={<FormattedMessage {...messages.information} />}
              />
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.votingMethod} />
              </Label>
              <Radio
                onChange={this.handeVotingMethodOnChange}
                currentValue={votingMethod}
                value="unlimited"
                name="votingmethod"
                id="votingmethod-unlimited"
                label={<FormattedMessage {...messages.unlimited} />}
              />
              <Radio
                onChange={this.handeVotingMethodOnChange}
                currentValue={votingMethod}
                value="limited"
                name="votingmethod"
                id="votingmethod-limited"
                label={<FormattedMessage {...messages.limited} />}
              />
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
                    onChange={this.handleVotingLimitOnChange}
                  />
                  {/* <Error fieldName="title_multiloc" apiErrors={this.state.apiErrors.title_multiloc} /> */}
                </div>
              }
              <Error text={noVotingLimit} />
            </SectionField>

            <StyledSectionField>
              <Label>
                <FormattedMessage {...messages.phasePermissions} />
              </Label>

              <ToggleRow>
                <ToggleLabel>
                  <FormattedMessage {...messages.postingEnabled} />
                </ToggleLabel>
                <Toggle checked={postingEnabled} onToggle={this.togglePostingEnabled} />
              </ToggleRow>

              <ToggleRow>
                <ToggleLabel>
                  <FormattedMessage {...messages.commentingEnabled} />
                </ToggleLabel>
                <Toggle checked={commentingEnabled} onToggle={this.toggleCommentingEnabled} />
              </ToggleRow>

              <ToggleRow>
                <ToggleLabel>
                  <FormattedMessage {...messages.votingEnabled} />
                </ToggleLabel>
                <Toggle checked={votingEnabled} onToggle={this.toggleVotingEnabled} />
              </ToggleRow>
            </StyledSectionField>

          </StyledSection>
        </Container>
      );
    }

    return null;
  }
}
