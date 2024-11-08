import React, { FormEvent } from 'react';

import { Label, Radio, fontSizes } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import styled from 'styled-components';
import { CRUDParams } from 'typings';

import { ISpamReportAdd, ReasonCode } from 'api/spam_reports/types';

import { SectionField } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import TextArea from 'components/UI/TextArea';

import { injectIntl } from 'utils/cl-intl';
import getSubmitState from 'utils/getSubmitState';

import messages from './messages';

const timeout = 300;

const StyledRadio = styled(Radio)`
  margin-bottom: 10px;
  cursor: pointer;

  .text {
    color: #333;
    font-size: ${fontSizes.base}px;
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

interface Props extends CRUDParams {
  reasonCodes: ReasonCode[];
  diff: ISpamReportAdd['spam_report'] | null;
  onReasonChange: { (value: ReasonCode): void };
  onTextChange: { (value: string): void };
  onSubmit: { (event: FormEvent): void };
}

interface State {}

class SpamReportForm extends React.PureComponent<
  Props & WrappedComponentProps,
  State
> {
  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { formatMessage } = this.props.intl;
    const submitStatus = getSubmitState({
      errors: this.props.errors,
      saved: this.props.saved,
      diff: this.props.diff,
    });

    return (
      <form onSubmit={this.props.onSubmit}>
        <SectionField>
          {this.props.reasonCodes.map((reasonCode) => (
            <StyledRadio
              onChange={this.props.onReasonChange}
              currentValue={this.props.diff ? this.props.diff.reason_code : ''}
              name="reasonCode"
              label={formatMessage(messages[reasonCode])}
              value={reasonCode}
              id={`reason-${reasonCode}`}
              key={reasonCode}
            />
          ))}
        </SectionField>

        <TransitionGroup>
          {this.props.diff && this.props.diff.reason_code === 'other' ? (
            <CSSTransition
              classNames="reason"
              timeout={timeout}
              enter={true}
              exit={true}
            >
              <ReportReason>
                <SectionField>
                  <Label htmlFor="text-area-reason" hidden>
                    {formatMessage(messages.other)}
                  </Label>
                  <TextArea
                    id="text-area-reason"
                    name="reasonText"
                    value={
                      // TODO: Fix this the next time the file is edited.
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                      this.props.diff ? this.props.diff.other_reason || '' : ''
                    }
                    onChange={this.props.onTextChange}
                    placeholder={formatMessage(messages.otherReasonPlaceholder)}
                  />
                </SectionField>
              </ReportReason>
            </CSSTransition>
          ) : null}
        </TransitionGroup>

        <SubmitWrapper
          buttonStyle="primary"
          status={submitStatus}
          loading={this.props.loading}
          messages={messages}
        />
      </form>
    );
  }
}

export default injectIntl(SpamReportForm);
