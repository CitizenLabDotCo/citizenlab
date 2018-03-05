import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import CustomFieldsForm from 'components/CustomFieldsForm';

// services
import { authUserStream } from 'services/auth';
import { updateUser, IUser } from 'services/users';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

import messages from './messages';

// style
import styled from 'styled-components';

// typings
import { API } from 'typings';

const Form = styled.div``;

const FormElement = styled.div`
  margin-bottom: 20px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SkipButton = styled.div`
  color: #999;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  cursor: pointer;
  margin-left: 15px;

  &:hover {
    color: #000;
  }
`;

type Props = {
  onCompleted: () => void;
};

type State = {
  authUser: IUser | null;
  customFieldsFormData: object | null;
  loading: boolean;
  processing: boolean;
  unknownError: string | null;
  apiErrors: API.ErrorResponse | null;
};

class Step2 extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      authUser: null,
      customFieldsFormData: null,
      loading: true,
      processing: false,
      unknownError: null,
      apiErrors: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      authUser$.subscribe((authUser) => {
        this.setState({ authUser, loading: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();

    const { formatMessage } = this.props.intl;
    const { authUser, customFieldsFormData } = this.state;

    if (authUser) {
      try {
        this.setState({
          processing: true,
          unknownError: null
        });

        if (customFieldsFormData && !_.isEmpty(customFieldsFormData)) {
          await updateUser(authUser.data.id, { custom_field_values: customFieldsFormData });
        }

        this.setState({ processing: false });
        this.props.onCompleted();

      } catch (error) {
        this.setState({
          processing: false,
          unknownError: formatMessage(messages.unknownError)
        });
      }
    }
  }

  handleCustomFieldsFormOnChange = (customFieldsResponse) => {
    this.setState({ customFieldsFormData: customFieldsResponse.schema.formData });
  }

  skipStep = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.props.onCompleted();
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { authUser, loading, processing, unknownError } = this.state;

    if (!loading && authUser) {
      return (
        <Form id="e2e-signup-step2">
          <CustomFieldsForm onChange={this.handleCustomFieldsFormOnChange} />

          <FormElement>
            <ButtonWrapper>
              <Button
                id="e2e-signup-step2-button"
                size="1"
                processing={processing}
                text={formatMessage(messages.submit)}
                onClick={this.handleOnSubmit}
                circularCorners={true}
              />
              <SkipButton onClick={this.skipStep}>{formatMessage(messages.skip)}</SkipButton>
            </ButtonWrapper>
            <Error text={unknownError} />
          </FormElement>
        </Form>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(Step2);
