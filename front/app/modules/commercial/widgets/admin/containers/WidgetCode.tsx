import React, { PureComponent, createRef } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

const CodeSnippet = styled.textarea`
  word-wrap: break-word;
  font-family: 'Courier New', Courier, monospace;
  background-color: ${colors.grey200};
  border: solid 1px ${colors.borderLight};
  border-radius: ${(props) => props.theme.borderRadius};
  padding: 15px;
  margin: 20px 0;
  width: 100%;
  min-height: 200px;
  user-select: all;
`;

interface InputProps {
  path: string;
  width: number;
  height: number;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  copied: boolean;
}
class WidgetCode extends PureComponent<Props & DataProps, State> {
  snippetRef = createRef<HTMLTextAreaElement>();

  constructor(props: Props & DataProps) {
    super(props);
    this.state = {
      copied: false,
    };
  }

  handleFocus = (event) => {
    event.target.select();
  };

  copy = (ref) => () => {
    ref.current.select();
    if (document.execCommand('copy')) {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 3000);

      const selection = window.getSelection();

      if (selection) {
        selection.removeAllRanges();
      }
    }
  };

  render() {
    const { path, tenant, width, height } = this.props;

    if (isNilOrError(tenant)) return null;

    const text = `<iframe src="https://${tenant.attributes.host}/widgets${path}" width="${width}" height="${height}" frameborder="0" scrolling="no"></iframe>`;

    return (
      <>
        <h1>
          <FormattedMessage {...messages.htmlCodeTitle} />
        </h1>
        <p>
          <FormattedMessage {...messages.htmlCodeExplanation} />
        </p>
        <CodeSnippet
          value={text}
          readOnly
          onFocus={this.handleFocus}
          ref={this.snippetRef}
        />
        <ButtonWithLink
          onClick={this.copy(this.snippetRef)}
          buttonStyle={'admin-dark'}
          bgColor={this.state.copied ? colors.success : colors.primary}
        >
          {this.state.copied ? (
            <FormattedMessage {...messages.copied} />
          ) : (
            <FormattedMessage {...messages.copyToClipboard} />
          )}
        </ButtonWithLink>
      </>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetAppConfiguration>
    {(tenant) => <WidgetCode {...inputProps} tenant={tenant} />}
  </GetAppConfiguration>
);
