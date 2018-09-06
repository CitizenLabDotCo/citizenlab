import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import { isNilOrError } from 'utils/helperUtils';

const CodeSnippet = styled.code`
  word-wrap: break-word;
  font-family: 'Courier New', Courier, monospace;
  background-color: ${colors.lightGreyishBlue};
  border: solid 1px ${colors.adminBorder};
  border-radius: 5px;
  padding: 15px;
  margin: 20px 0;
  width: 100%;
  min-height: 200px;
`;

interface Props {
  path: String;
  width: number;
  height: number;
}

interface DataProps {
  tenant: GetTenantChildProps;
}

interface State {}

class WidgetCode extends PureComponent<Props & DataProps, State> {

  render() {
    const { path, tenant, width, height } = this.props;
    if (isNilOrError(tenant)) return null;

    return (
      <>
        <h1>
          <FormattedMessage {...messages.htmlCodeTitle} />
        </h1>
        <p>
          <FormattedMessage {...messages.htmlCodeExplanation} />
        </p>
        <CodeSnippet>
          {`
            <iframe src="https://${tenant.attributes.host}/widgets${path}" width="${width}" height="${height} frameborder="0" scrolling="no" />
          `}
        </CodeSnippet>
      </>
    );
  }
}

export default (inputProps) => (
  <GetTenant>
    {(tenant) => <WidgetCode {...inputProps} tenant={tenant} />}
  </GetTenant>
);
