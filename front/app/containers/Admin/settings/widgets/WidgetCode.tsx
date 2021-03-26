import React, { PureComponent, createRef } from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';
import Button from 'components/UI/Button';

const CodeSnippet = styled.textarea`
  word-wrap: break-word;
  font-family: 'Courier New', Courier, monospace;
  background-color: ${colors.lightGreyishBlue};
  border: solid 1px ${colors.adminBorder};
  border-radius: ${(props: any) => props.theme.borderRadius};
  padding: 15px;
  margin: 20px 0;
  width: 100%;
  min-height: 200px;
  user-select: all;
`;

interface Props {
  path: String;
  width: number;
  height: number;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
}

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
        <Button
          onClick={this.copy(this.snippetRef)}
          buttonStyle={this.state.copied ? 'success' : 'admin-dark'}
        >
          {this.state.copied ? (
            <FormattedMessage {...messages.copied} />
          ) : (
            <FormattedMessage {...messages.copyToClipboard} />
          )}
        </Button>
      </>
    );
  }
}

export default (inputProps) => (
  <GetAppConfiguration>
    {(tenant) => <WidgetCode {...inputProps} tenant={tenant} />}
  </GetAppConfiguration>
);
