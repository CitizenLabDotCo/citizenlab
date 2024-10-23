import React, { PureComponent } from 'react';

import qs from 'qs';
import styled from 'styled-components';

import { IAppConfiguration } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { isNilOrError } from 'utils/helperUtils';

const StyledIframe = styled.iframe`
  border: 0;
  height: ${(props) => (props.height ? `${props.height}px` : 'auto')};
  width: 100%;
`;

interface DataProps {
  tenant: IAppConfiguration | undefined;
  fragmentsFeatureFlag: boolean;
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

  constructor(props: Props) {
    super(props);
    this.state = {
      iframeHeight: undefined,
    };
  }

  fragmentUrl = (): string => {
    const { tenant, queryParameters } = this.props;
    if (!isNilOrError(tenant)) {
      const params = qs.stringify(queryParameters, { addQueryPrefix: true });
      return `/fragments/${tenant.data.id}/${this.props.name}.html${params}`;
    } else {
      return '';
    }
  };

  fragmentActive = () => {
    const { tenant, fragmentsFeatureFlag } = this.props;
    if (
      isNilOrError(tenant) ||
      !fragmentsFeatureFlag ||
      !tenant.data.attributes.settings.fragments
    ) {
      return false;
    }

    return tenant.data.attributes.settings.fragments.enabled_fragments.includes(
      this.props.name
    );
  };

  setIframeRef = (ref) => {
    this.iframeNode = ref;
  };

  setIframeHeight = () => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

export default (inputProps: InputProps) => {
  const { data: tenant } = useAppConfiguration();
  const fragmentsFeatureFlag = useFeatureFlag({ name: 'fragments' });

  return (
    <Fragment
      {...inputProps}
      tenant={tenant}
      fragmentsFeatureFlag={fragmentsFeatureFlag}
    />
  );
};
