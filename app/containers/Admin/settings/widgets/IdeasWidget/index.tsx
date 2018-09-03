import * as React from 'react';
import styled from 'styled-components';
import { debounce } from 'lodash';
import { stringify } from 'qs';
import Form, { FormValues } from './Form';
import { Formik, FormikErrors } from 'formik';
import WidgetPreview from '../WidgetPreview';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import Modal from 'components/UI/Modal';
import WidgetCode from '../WidgetCode';
import Button from 'components/UI/Button';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const StyledWidgetPreview = styled(WidgetPreview)`
  margin-bottom: 40px;
`;

type Props = {};

type State = {
  widgetParams: Partial<FormValues>;
  codeModalOpened: boolean;
};

class IdeasWidget extends React.Component<Props, State> {

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
  }

  initialValues = (): FormValues => ({
    width: 300,
    height: 400,
    showHeader: true,
    headerText: '',
    projects: [],
    topics: [],
    limit: 5,
  })

  handleOnSubmit = (values: FormValues, { setSubmitting }) => {
    this.setState({ widgetParams: { ...this.state.widgetParams, ...values } });
    setSubmitting(false);
  }

  generateWidgetParams = () => {
    return stringify(this.state.widgetParams);
  }

  handleCloseCodeModal = () => {
    this.setState({ codeModalOpened: false });
  }

  handleShowCodeClick = () => {
    this.setState({ codeModalOpened: true });
  }

  renderIdeasFormFn = (props) => {
    // This is a hack to react on Formik form changes without submitting,
    // since there is no global onChange()
    // See https://github.com/jaredpalmer/formik/issues/271
    this.debouncedSetState({ widgetParams: { ...this.state.widgetParams, ...props.values } });

    return <Form {...props} />;
  }

  render() {
    const { widgetParams: { width, height }, codeModalOpened } = this.state;
    return (
      <Container>
        <div>
          <h3>
            <FormattedMessage {...messages.settingsTitle} />
          </h3>
          <Formik
            initialValues={this.initialValues()}
            render={this.renderIdeasFormFn}
            validate={this.validate}
            onSubmit={this.handleOnSubmit}
          />
        </div>
        <div>
          <h3>
            <FormattedMessage {...messages.previewTitle} />
          </h3>
          <StyledWidgetPreview
            path={`/ideas?${this.generateWidgetParams()}`}
            width={width || 300}
            height={height || 400}
          />
          <Button
            onClick={this.handleShowCodeClick}
            style="cl-blue"
            icon="code"
          >
            <FormattedMessage {...messages.exportHtmlCodeButton} />
          </Button>
        </div>
        <Modal
          opened={codeModalOpened}
          close={this.handleCloseCodeModal}
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

export default IdeasWidget;
