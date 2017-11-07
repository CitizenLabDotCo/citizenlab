import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { browserHistory } from 'react-router';

// components
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Select from 'components/UI/Select';

// services
import { authUserStream } from 'services/auth';
import { areasStream, IAreas, IAreaData } from 'services/areas';
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { updateUser, IUser } from 'services/users';

// i18n
import { getLocalized } from 'utils/i18n';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';

// typings
import { API, IOption } from 'typings.d';

const Form = styled.form`
  width: 100%;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

type Props = {
  onCompleted: () => void;
};

type State = {
  authUser: IUser | null;
  locale: string | null;
  currentTenant: ITenant | null;
  areas: IOption[] | null;
  years: IOption[];
  yearOfBirth: IOption | null;
  gender: IOption | null;
  area: IOption | null;
  loading: boolean;
  processing: boolean;
  unknownError: string | null;
  apiErrors: API.ErrorResponse | null;
};

class Step2 extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      authUser: null,
      locale: null,
      currentTenant: null,
      areas: null,
      years: [...Array(118).keys()].map((i) => ({ value: i + 1900, label: `${i + 1900}` })),
      yearOfBirth: null,
      gender: null,
      area: null,
      loading: true,
      processing: false,
      unknownError: null,
      apiErrors: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const authUser$ = authUserStream().observable;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const areas$ = areasStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        authUser$,
        locale$,
        currentTenant$,
        areas$
      ).subscribe(([authUser, locale, currentTenant, areas]) => {
        this.setState({
          authUser,
          locale,
          currentTenant,
          areas: this.getOptions(areas, locale, currentTenant),
          loading: false
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getOptions(list: IAreas, locale: string, currentTenant: ITenant) {
    if (list && locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;

      return (list.data as IAreaData[]).map(item => ({
        value: item.id,
        label: getLocalized(item.attributes.title_multiloc, locale, currentTenantLocales),
      } as IOption));
    }

    return null;
  }

  handleYearOfBirthOnChange = (yearOfBirth: IOption) => {
    this.setState({ yearOfBirth });
  }

  handleGenderOnChange = (gender: IOption) => {
    this.setState({ gender });
  }

  handleAreaOnChange = (area: IOption) => {
    this.setState({ area });
  }

  handleOnSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();

    const { formatMessage } = this.props.intl;
    const { authUser, yearOfBirth, gender, area } = this.state;

    if (authUser) {
      try {
        this.setState({
          processing: true,
          unknownError: null
        });

        const updatedUserProps = _.omitBy({
          birthyear: (yearOfBirth ? parseInt(yearOfBirth.value, 10) : undefined),
          gender: (gender ? gender.value : undefined),
          domicile: (area ? area.value : undefined)
        }, _.isEmpty);

        if (updatedUserProps && !_.isEmpty(updatedUserProps)) {
          await updateUser(authUser.data.id, updatedUserProps);
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

  render() {
    const { formatMessage } = this.props.intl;
    const { authUser, areas, years, yearOfBirth, gender, area, loading, processing, unknownError } = this.state;

    if (!loading && authUser === null) {
      browserHistory.push('/');
    }

    if (!loading && authUser !== null) {
      return (
        <Form id="e2e-signup-step2" onSubmit={this.handleOnSubmit} noValidate={true}>
          <FormElement>
            <Label value={formatMessage(messages.yearOfBirthLabel)} htmlFor="yearOfBirth" />
            <Select
              clearable={true}
              searchable={true}
              value={yearOfBirth}
              placeholder={formatMessage(messages.yearOfBirthPlaceholder)}
              options={years}
              onChange={this.handleYearOfBirthOnChange}
            />
          </FormElement>

          <FormElement>
            <Label value={formatMessage(messages.genderLabel)} htmlFor="gender" />
            <Select
              clearable={true}
              value={gender}
              placeholder={formatMessage(messages.genderPlaceholder)}
              options={[{
                value: 'male',
                label: formatMessage(messages.male),
              }, {
                value: 'female',
                label: formatMessage(messages.female),
              }, {
                value: 'unspecified',
                label: formatMessage(messages.unspecified),
              }]}
              onChange={this.handleGenderOnChange}
            />
          </FormElement>

          <FormElement>
            <Label value={formatMessage(messages.areaLabel)} htmlFor="area" />
            <Select
              clearable={true}
              value={area}
              placeholder={formatMessage(messages.areaPlaceholder)}
              options={areas}
              onChange={this.handleAreaOnChange}
            />
          </FormElement>

          <FormElement>
            <Button
              size="2"
              loading={processing}
              text={formatMessage(messages.submit)}
              onClick={this.handleOnSubmit}
              circularCorners={true}
            />
            <Error text={unknownError} />
          </FormElement>
        </Form>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(Step2);
