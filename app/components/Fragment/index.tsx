import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import qs from 'qs';

// styling
import styled from 'styled-components';

// resources
import GetAppConfiguration, { GetTenantChildProps } from 'resources/GetTenant';
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';

const StyledIframe = styled.iframe`
  border: 0;
  height: ${(props) => (props.height ? `${props.height}px` : 'auto')};
  width: 100%;
`;

interface DataProps {
  tenant: GetTenantChildProps;
  fragmentsFeatureFlag: GetFeatureFlagChildProps;
}

interface InputProps {
  name: string;
  title?: string;
  children?: any;
  className?: string;
  queryParameters?: { [key: string]: string };
}

interface Props extends DataProps, InputProps {}

interface State {
  iframeHeight?: number;
}

/**
 * Wrap content in a named fragment to allow the content to be overridden
 * for a specific tenant
 */
class Fragment extends PureComponent<Props, State> {
  iframeNode: HTMLIFrameElement;

  constructor(props) {
    super(props);
    this.state = {
      iframeHeight: undefined,
    };
  }

  fragmentUrl = (): string => {
    const { tenant, queryParameters } = this.props;
    if (!isNilOrError(tenant)) {
      const params = qs.stringify(queryParameters, { addQueryPrefix: true });
      return `/fragments/${tenant.id}/${this.props.name}.html${params}`;
    } else {
      return '';
    }
  };

  fragmentActive = (): boolean => {
    const { tenant, fragmentsFeatureFlag } = this.props;
    if (
      isNilOrError(tenant) ||
      !fragmentsFeatureFlag ||
      !tenant.attributes.settings.fragments
    ) {
      return false;
    }
    {
      return tenant.attributes.settings.fragments.enabled_fragments.includes(
        this.props.name
      );
    }
  };

  setIframeRef = (ref) => {
    this.iframeNode = ref;
  };

  setIframeHeight = () => {
    if (this.iframeNode && this.iframeNode.contentWindow) {
      this.setState({
        iframeHeight:
          this.iframeNode.contentWindow.document.body.scrollHeight * 1.1,
      });
    }
  };

  render() {
    const { children, title, className } = this.props;
    const { iframeHeight } = this.state;

    if (this.fragmentActive()) {
      return (
        <StyledIframe
          className={className}
          title={title}
          ref={this.setIframeRef}
          src={this.fragmentUrl()}
          height={iframeHeight}
          onLoad={this.setIframeHeight}
        />
      );
    } else {
      return children || null;
    }
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  fragmentsFeatureFlag: <GetFeatureFlag name="fragments" />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <Fragment {...inputProps} {...dataProps} />}
  </Data>
);
