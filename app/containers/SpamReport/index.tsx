// libraries
import * as React from 'react';

// Services
import { sendSpamReport, Report } from 'services/spamReports';

// Components
import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import Radio from 'components/UI/Radio';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// Style
import styled from 'styled-components';

const RadioButtonsWrapper = styled.div`
  margin-top: 15px;
  margin-bottom: 30px;
`;

const StyledRadio = styled(Radio)`
  margin-bottom: 10px;
  cursor: pointer;

  .text {
    color: #333;
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
  }
`;

// Typings
interface Props {}
interface State {
  reasonCode: Report['reason_code'] | null;
  reasonText: Report['other_reason'] | null;
}

class SpamReportForm extends React.Component<Props & InjectedIntlProps, State> {

  constructor (props) {
    super(props);

    this.state = {
      reasonCode: null,
      reasonText: null,
    };
  }

  handleSelectionChange = (reasonCode) => {
    this.setState({ reasonCode });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    console.log('sending report');
  }

  render () {
    const { formatMessage } = this.props.intl;

    return (
      <form onSubmit={this.handleSubmit}>
        <Section>
          <SectionTitle><FormattedMessage {...messages.title} /></SectionTitle>

          <RadioButtonsWrapper>
            {['wrong_content', 'inappropriate', 'other'].map((reasonCode) => (
              <StyledRadio
                onChange={this.handleSelectionChange}
                currentValue={this.state.reasonCode}
                name="reasonCode"
                label={formatMessage(messages[reasonCode])}
                value={reasonCode}
                id={`reason-${reasonCode}`}
                key={reasonCode}
              />
            ))}
          </RadioButtonsWrapper>
        </Section>
      </form>
    );
  }
}

export default injectIntl<Props>(SpamReportForm);
