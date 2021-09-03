import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { debounce, omitBy, isNil, isEmpty, isString } from 'lodash-es';
import { stringify } from 'qs';

import Form, { FormValues } from './Form';
import { Formik, FormikErrors } from 'formik';

import WidgetPreview from '../WidgetPreview';
import Modal from 'components/UI/Modal';
import WidgetCode from '../WidgetCode';
import Button from 'components/UI/Button';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

const Container = styled.div`
  display: flex;
`;

const WidgetConfigWrapper = styled.div`
  flex: 1 1 500px;
  display: flex;
  flex-direction: column;
`;

const WidgetPreviewWrapper = styled.div``;

const WidgetTitle = styled.h3``;

const StyledWidgetPreview = styled(WidgetPreview)`
  margin-bottom: 40px;
`;

interface Props {}

type State = {
  widgetParams: Partial<FormValues>;
  codeModalOpened: boolean;
};

class IdeasWidget extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      widgetParams: this.initialValues(),
      codeModalOpened: false,
    };
  }

  debouncedSetState = debounce((stateUpdate) => {
    this.setState(stateUpdate);
  }, 400);

  validate = (): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};
    return errors;
  };

  initialValues = (): FormValues => {
    const { formatMessage } = this.props.intl;
    return {
      width: 320,
      height: 400,
      siteBgColor: '#ffffff',
      bgColor: '#ffffff',
      textColor: '#666666',
      accentColor: '#2233aa',
      font: null,
      fontSize: 15,
      relativeLink: '/',
      showHeader: true,
      showLogo: true,
      headerText: formatMessage(messages.fieldHeaderTextDefault),
      headerSubText: formatMessage(messages.fieldHeaderSubTextDefault),
      showFooter: true,
      buttonText: formatMessage(messages.fieldButtonTextDefault),
      sort: 'trending',
      projects: [],
      topics: [],
      limit: 5,
    };
  };

  handleOnSubmit = (values: FormValues, { setSubmitting }) => {
    this.setState(({ widgetParams }) => ({
      widgetParams: {
        ...widgetParams,
        ...values,
      },
    }));
    setSubmitting(false);
  };

  generateWidgetParams = () => {
    const { widgetParams } = this.state;
    const cleanedParams = omitBy(
      widgetParams,
      (v) => isNil(v) || (isString(v) && isEmpty(v))
    );
    return stringify(cleanedParams);
  };

  handleCloseCodeModal = () => {
    this.setState({ codeModalOpened: false });
  };

  handleShowCodeClick = () => {
    this.setState({ codeModalOpened: true });
    trackEventByName(tracks.clickAdminExportHTML.name);
  };

  renderIdeasFormFn = (props) => {
    // This is a hack to react on Formik form changes without submitting,
    // since there is no global onChange()
    // See https://github.com/jaredpalmer/formik/issues/271
    this.debouncedSetState({
      widgetParams: {
        ...this.state.widgetParams,
        ...props.values,
      },
    });

    return <Form {...props} />;
  };

  render() {
    const {
      widgetParams: { width, height },
      codeModalOpened,
    } = this.state;
    return (
      <Container>
        <WidgetConfigWrapper>
          <WidgetTitle>
            <FormattedMessage {...messages.settingsTitle} />
          </WidgetTitle>
          <Formik
            initialValues={this.initialValues()}
            render={this.renderIdeasFormFn}
            validate={this.validate}
            onSubmit={this.handleOnSubmit}
          />
        </WidgetConfigWrapper>
        <WidgetPreviewWrapper>
          <WidgetTitle>
            <FormattedMessage {...messages.previewTitle} />
          </WidgetTitle>
          <StyledWidgetPreview
            path={`/ideas?${this.generateWidgetParams()}`}
            width={width || 300}
            height={height || 400}
          />
          <Button
            onClick={this.handleShowCodeClick}
            buttonStyle="cl-blue"
            icon="code"
          >
            <FormattedMessage {...messages.exportHtmlCodeButton} />
          </Button>
        </WidgetPreviewWrapper>

        <Modal
          opened={codeModalOpened}
          close={this.handleCloseCodeModal}
          fixedHeight={true}
        >
          <WidgetCode
            path={`/ideas?${this.generateWidgetParams()}`}
            width={width || 300}
            height={height || 400}
          />
        </Modal>
      </Container>
    );
  }
}

export default injectIntl(IdeasWidget);
