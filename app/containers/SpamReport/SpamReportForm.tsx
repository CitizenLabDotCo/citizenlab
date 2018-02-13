// libraries
import * as React from 'react';

// Services
import { Report } from 'services/spamReports';

// Utils
import getSubmitState from 'utils/getSubmitState';

// Components
import { SectionField, SectionTitle, SectionSubtitle } from 'components/admin/Section';
import Radio from 'components/UI/Radio';
import TextArea from 'components/UI/TextArea';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// animation
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';

// Style
import styled from 'styled-components';
import { fontSize } from 'utils/styleUtils';

const timeout = 300;

const StyledRadio = styled(Radio)`
  margin-bottom: 10px;
  cursor: pointer;

  .text {
    color: #333;
    font-size: ${fontSize('base')};
    font-weight: 400;
    line-height: 22px;
  }
`;

const ReportReason = styled.div`
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
  overflow: hidden;

  &.reason-enter {
    max-height: 0px;
    opacity: 0;

    &.reason-enter-active {
      max-height: 180px;
      opacity: 1;
    }
  }

  &.reason-exit {
    max-height: 180px;
    opacity: 1;

    &.reason-exit-active {
      max-height: 0px;
      opacity: 0;
    }
  }
`;

// Typings
import { Forms } from 'typings';

interface Props extends Forms.crudParams {
  reasonCodes: Report['reason_code'][];
  diff: Report | null;
  onReasonChange: {(value: Report['reason_code']): void};
  onTextChange: {(value: string): void};
  onSubmit: {(event): void};
  itemType: 'ideas' | 'comments';
}

interface State {}

class SpamReportForm extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor (props) {
    super(props);
    this.state = {};
  }

  render () {
    const { formatMessage } = this.props.intl;
    const submitStatus = getSubmitState({ errors: this.props.errors, saved: this.props.saved, diff: this.props.diff });

    return (
      <form onSubmit={this.props.onSubmit}>
        <SectionTitle><FormattedMessage {...messages.title} /></SectionTitle>
        <SectionSubtitle><FormattedMessage {...messages.subtitle} /></SectionSubtitle>

        <SectionField>
          {this.props.reasonCodes.map((reasonCode) => (
            <StyledRadio
              onChange={this.props.onReasonChange}
              currentValue={this.props.diff ? this.props.diff.reason_code : ''}
              name="reasonCode"
              label={formatMessage(messages[reasonCode], { itemType: this.props.itemType })}
              value={reasonCode}
              id={`reason-${reasonCode}`}
              key={reasonCode}
            />
          ))}
        </SectionField>

        <TransitionGroup>
          {(this.props.diff && this.props.diff.reason_code === 'other') ? (
            <CSSTransition
              classNames="reason" 
              timeout={timeout}
              enter={true}
              exit={true}
            >
              <ReportReason>
                <SectionField>
                  <TextArea
                    autofocus={true}
                    name="reasonText"
                    value={this.props.diff ? this.props.diff.other_reason || '' : ''}
                    onChange={this.props.onTextChange}
                    placeholder={formatMessage(messages.otherReasonPlaceholder)}
                  />
                </SectionField>
              </ReportReason>
            </CSSTransition>
          ) : null}
        </TransitionGroup>

        <SubmitWrapper
          style="primary"
          status={submitStatus}
          loading={this.props.loading}
          messages={messages}
        />
      </form>
    );
  }
}

export default injectIntl<Props>(SpamReportForm);
