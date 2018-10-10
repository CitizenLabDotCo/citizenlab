import React, { PureComponent } from 'react';

// services
import { PostingDisabledReasons } from 'services/projects';
import { postingButtonState } from 'services/ideaPostingRules';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// components
import Button, { ButtonStyles } from 'components/UI/Button';
import Tooltip from 'components/UI/Tooltip';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
}

interface InputProps {
  projectId?: string | undefined;
  phaseId?: string | undefined;
  style?: ButtonStyles;
  size?: '1' | '2' | '3' | '4';
  padding?: string;
}

interface Props extends InputProps, DataProps {};

class IdeaButton extends PureComponent<Props & InjectedIntlProps> {

  disabledMessages: { [key in PostingDisabledReasons]: ReactIntl.FormattedMessage.MessageDescriptor } = {
    project_inactive: messages.postingHereImpossible,
    not_ideation: messages.postingHereImpossible,
    posting_disabled: messages.postingHereImpossible,
    not_permitted: messages.postingNotPermitted,
  };

  render() {
    const { project, phase } = this.props;

    if (isNilOrError(project)) return null;

    const { show, enabled, disabledReason } = postingButtonState({ project, phaseContext: phase });

    if (show) {
      let { style, size } = this.props;
      const { padding } = this.props;
      const startAnIdeaText = this.props.intl.formatMessage(messages.startAnIdea);

      style = (style || 'primary');
      size = (size || '1');

      return (
        <Tooltip
          enabled={!enabled && !!disabledReason}
          content={disabledReason ? <FormattedMessage {...this.disabledMessages[disabledReason]} /> : <></>}
          top="55px"
        >
          <Button
            className={this.props['className']}
            linkTo={(project ? `/projects/${project.attributes.slug}/ideas/new` : '/ideas/new')}
            style={style}
            size={size}
            padding={padding}
            text={startAnIdeaText}
            circularCorners={false}
            disabled={!enabled}
          />
        </Tooltip>
      );
    }

    return null;
  }
}

const IdeaButtonWithHOCs = injectIntl<Props>(IdeaButton);

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render, }) => <GetProject id={projectId}>{render}</GetProject>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaButtonWithHOCs {...inputProps} {...dataProps} />}
  </Data>
)
