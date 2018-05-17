import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isFinite, isEqual } from 'lodash';

// components
import Input from 'components/UI/Input';
import Error from 'components/UI/Error';
import Label from 'components/UI/Label';
import Radio from 'components/UI/Radio';
import Toggle from 'components/UI/Toggle';
import { Section, SectionField } from 'components/admin/Section';

// services
import { projectByIdStream, IProject } from 'services/projects';
import { phaseStream, IPhase, ParticipationMethod, SurveyServices } from 'services/phases';
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import FeatureFlag from 'components/FeatureFlag';

const Container = styled.div``;

const StyledSection = styled(Section)`
  margin-bottom: 0;
`;

const StyledSectionField = styled(SectionField)`
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const ToggleRow = Row.extend`
  margin-bottom: 10px;

  &.last {
    margin-bottom: 0px;
  }
`;

const ToggleLabel = styled(Label)`
  width: 100%;
  max-width: 200px;
  color: #333;
  font-size: 16px;
  font-weight: 400;
`;

const VotingLimitInput = styled(Input)`
  width: 100px;
  height: 46px !important;
`;

export interface IParticipationContextConfig {
  participationMethod: ParticipationMethod;
  postingEnabled: boolean | null;
  commentingEnabled: boolean | null;
  votingEnabled: boolean | null;
  votingMethod: 'unlimited' | 'limited' | null;
  votingLimit: number | null;
  presentationMode: 'map' | 'card' | null;
  survey_service?: SurveyServices | null;
  survey_embed_url?: string | null;
}

type Props = {
  onChange: (arg: IParticipationContextConfig) => void;
  onSubmit: (arg: IParticipationContextConfig) => void;
  projectId?: string | undefined | null;
  phaseId?: string | undefined | null;
};

interface State extends IParticipationContextConfig {
  noVotingLimit: JSX.Element | null;
  loaded: boolean;
}

export default class ParticipationContext extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      participationMethod: 'ideation',
      postingEnabled: true,
      commentingEnabled: true,
      votingEnabled: true,
      votingMethod: 'unlimited',
      votingLimit: 5,
      noVotingLimit: null,
      loaded: false,
      presentationMode: 'card'
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { projectId, phaseId } = this.props;
    let data$: Rx.Observable<IProject | IPhase | null> = Rx.Observable.of(null);

    if (projectId) {
      data$ = projectByIdStream(projectId).observable;
    } else if (phaseId) {
      data$ = phaseStream(phaseId).observable;
    }

    this.subscriptions = [
      data$.subscribe((data) => {
        if (data) {
          const {
            participation_method,
            posting_enabled,
            commenting_enabled,
            voting_enabled,
            voting_method,
            voting_limited_max,
            presentation_mode,
            survey_embed_url,
            survey_service,
          } = data.data.attributes;

          this.setState({
            survey_embed_url,
            survey_service,
            participationMethod: participation_method as ParticipationMethod,
            postingEnabled: posting_enabled,
            commentingEnabled: commenting_enabled,
            votingEnabled: voting_enabled,
            votingMethod: voting_method,
            votingLimit: voting_limited_max,
            presentationMode: presentation_mode,
            loaded: true
          });
        } else {
          this.setState({ loaded: true });
        }
      }),

      eventEmitter
        .observeEvent('getParticipationContext')
        .filter(() => this.validate())
        .subscribe(() => {
          const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit, presentationMode } = this.state;
          
          this.props.onSubmit({
            participationMethod,
            postingEnabled: (participationMethod === 'ideation' ? postingEnabled : null),
            commentingEnabled: (participationMethod === 'ideation' ? commentingEnabled : null),
            votingEnabled: (participationMethod === 'ideation' ? votingEnabled : null),
            votingMethod: (participationMethod === 'ideation' ? votingMethod : null),
            votingLimit: (participationMethod === 'ideation' && votingMethod === 'limited' ? votingLimit : null),
            presentationMode: (participationMethod === 'ideation' ? presentationMode : null),
            survey_embed_url: (participationMethod === 'survey' ? this.state.survey_embed_url : null),
            survey_service: (participationMethod === 'survey' ? this.state.survey_service : null),
          });
        })
    ];
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    const { noVotingLimit: prevNoVotingLimit , loaded: prevLoaded, ...prevPartialState } = prevState;
    const { noVotingLimit: nextNoVotingLimit, loaded: nextLoaded, ...nextPartialState } = this.state;

    if (!isEqual(prevPartialState, nextPartialState)) {
      const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit, presentationMode } = this.state;

      this.props.onChange({
        participationMethod,
        postingEnabled: (participationMethod === 'ideation' ? postingEnabled : null),
        commentingEnabled: (participationMethod === 'ideation' ? commentingEnabled : null),
        votingEnabled: (participationMethod === 'ideation' ? votingEnabled : null),
        votingMethod: (participationMethod === 'ideation' ? votingMethod : null),
        votingLimit: (participationMethod === 'ideation' && votingMethod === 'limited' ? votingLimit : null),
        presentationMode: (participationMethod === 'ideation' ? presentationMode : null),
      });
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleParticipationMethodOnChange = (participationMethod: 'ideation' | 'information') => {
    this.setState({
      participationMethod,
      postingEnabled: (participationMethod === 'ideation' ? true : null),
      commentingEnabled: (participationMethod === 'ideation' ? true : null),
      votingEnabled: (participationMethod === 'ideation' ? true : null),
      votingMethod: (participationMethod === 'ideation' ? 'unlimited' : null),
      votingLimit: null,
      presentationMode: (participationMethod === 'ideation' ? 'card' : null),
      survey_embed_url: null,
      survey_service: null,
    });
  }

  handleSurveyProviderChange = (survey_service: SurveyServices) => {
    this.setState({ survey_service });
  }

  handleSurveyEmbedUrlChange = (survey_embed_url: string) => {
    this.setState({ survey_embed_url });
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
    this.setState({
      votingMethod,
      votingLimit: (votingMethod === 'unlimited' ? null : 5)
    });
  }

  handleVotingLimitOnChange = (votingLimit: string) => {
    this.setState({ votingLimit: parseInt(votingLimit, 10) });
  }

  handleIdeasDisplayChange = (value: 'map' | 'card') => {
    this.setState({
      presentationMode: value,
    });
  }

  validate() {
    let isValidated = true;
    let noVotingLimit: JSX.Element | null = null;
    const { votingMethod, votingLimit } = this.state;

    if (votingMethod === 'limited' && (!votingLimit || !isFinite(votingLimit) || votingLimit < 1)) {
      noVotingLimit = <FormattedMessage {...messages.noVotingLimitErrorMessage} />;
      isValidated = false;
    }

    this.setState({ noVotingLimit });

    return isValidated;
  }

  render() {
    const className = this.props['className'];
    const {
      participationMethod,
      postingEnabled,
      commentingEnabled,
      votingEnabled,
      loaded,
      survey_service,
      survey_embed_url,
      votingMethod,
      votingLimit,
      noVotingLimit,
      presentationMode
    } = this.state;

    const votingLimitSection = (participationMethod === 'ideation' && votingMethod === 'limited') ? (
      <>
        <Label htmlFor="voting-title">
          <FormattedMessage {...messages.votingLimit} />
        </Label>
        <VotingLimitInput
          id="voting-limit"
          type="number"
          min="1"
          placeholder=""
          value={(votingLimit ? votingLimit.toString() : null)}
          onChange={this.handleVotingLimitOnChange}
        />
        {/* <Error fieldName="title_multiloc" apiErrors={this.state.apiErrors.title_multiloc} /> */}
      </>
    ) : null;

    if (loaded) {
      return (
        <Container className={className}>
          <StyledSection>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.participationMethod} />
              </Label>
              {['ideation', 'information'].map((method) => (
                <Radio
                  onChange={this.handleParticipationMethodOnChange}
                  currentValue={participationMethod}
                  value={method}
                  name="participationmethod"
                  id={`participationmethod-${method}`}
                  label={<FormattedMessage {...messages[method]} />}
                  key={method}
                />
              ))}
              <FeatureFlag name="surveys">
                <Radio
                  onChange={this.handleParticipationMethodOnChange}
                  currentValue={participationMethod}
                  value="survey"
                  name="participationmethod"
                  id={`participationmethod-survey`}
                  label={<FormattedMessage {...messages.survey} />}
                />
              </FeatureFlag>

            </SectionField>

            {participationMethod === 'ideation' &&
              <>
                <StyledSectionField>
                  <Label>
                    <FormattedMessage {...messages.phasePermissions} />
                  </Label>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.postingEnabled} />
                    </ToggleLabel>
                    <Toggle value={postingEnabled as boolean} onChange={this.togglePostingEnabled} />
                  </ToggleRow>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.commentingEnabled} />
                    </ToggleLabel>
                    <Toggle value={commentingEnabled as boolean} onChange={this.toggleCommentingEnabled} />
                  </ToggleRow>

                  <ToggleRow className="last">
                    <ToggleLabel>
                      <FormattedMessage {...messages.votingEnabled} />
                    </ToggleLabel>
                    <Toggle value={votingEnabled as boolean} onChange={this.toggleVotingEnabled} />
                  </ToggleRow>
                </StyledSectionField>
                {votingEnabled &&
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
                    {votingLimitSection}
                    <Error text={noVotingLimit} />
                  </SectionField>
                }
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.defaultDisplay} />
                  </Label>
                  {['card', 'map'].map((key) => (
                    <Radio
                      key={key}
                      onChange={this.handleIdeasDisplayChange}
                      currentValue={presentationMode}
                      value={key}
                      name="presentation_mode"
                      id={`presentation_mode-${key}`}
                      label={<FormattedMessage {...messages[`${key}Display`]} />}
                    />
                  ))}
                </SectionField>
              </>
            }

            {participationMethod === 'survey' &&
              <React.Fragment>
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.surveyService} />
                  </Label>
                  {['typeform', 'survey_monkey'].map((provider) => (
                    <Radio
                      onChange={this.handleSurveyProviderChange}
                      currentValue={survey_service}
                      value={provider}
                      name="survey-provider"
                      id={`survey-provider-${provider}`}
                      label={<FormattedMessage {...messages[provider]} />}
                      key={provider}
                    />
                  ))}
                </SectionField>
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.surveyEmbedUrl} />
                  </Label>
                  <Input
                    onChange={this.handleSurveyEmbedUrlChange}
                    type="text"
                    value={survey_embed_url}
                  />
                </SectionField>
              </React.Fragment>
            }

          </StyledSection>
        </Container>
      );
    }

    return null;
  }
}
