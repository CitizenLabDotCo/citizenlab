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
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

import messages from './messages';

// style
import styled from 'styled-components';

// typings
import { API, IOption, Locale } from 'typings';

const Form = styled.form`
  width: 100%;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const ButtonWrapper = styled.div`
  width: 100%;
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

  &:hover {
    color: #000;
  }
`;

type Props = {
  onCompleted: () => void;
};

type State = {
  authUser: IUser | null;
  locale: Locale | null;
  currentTenant: ITenant | null;
  areas: IOption[] | null;
  years: IOption[];
  selectedYearOfBirth: IOption | null;
  selectedGender: IOption | null;
  selectedArea: IOption | null;
  loading: boolean;
  processing: boolean;
  unknownError: string | null;
  apiErrors: API.ErrorResponse | null;
};

class Step2 extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      authUser: null,
      locale: null,
      currentTenant: null,
      areas: null,
      years: [...Array(118).keys()].map((i) => ({ value: i + 1900, label: `${i + 1900}` })),
      selectedYearOfBirth: null,
      selectedGender: null,
      selectedArea: null,
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
    const areas$ = areasStream().observable;
    const currentTenant$ = currentTenantStream().observable.do((currentTenant) => {
      const { birthyear, domicile, gender } = currentTenant.data.attributes.settings.demographic_fields;
      const demographicFieldsEnabled = _.get(currentTenant, `data.attributes.settings.demographic_fields.enabled`);
      const hasOneOrMoreActiveDemographicFields = [birthyear, domicile, gender].some(value => value === true);

      if (!demographicFieldsEnabled || !hasOneOrMoreActiveDemographicFields) {
        // no fields are configured to be visible
        this.props.onCompleted();
      }
    });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        authUser$,
        locale$,
        currentTenant$,
        areas$
      ).subscribe(([authUser, locale, currentTenant, areas]) => {
        if (!authUser) {
          // redirect to landingpage when user is not logged in
          browserHistory.push('/');
        } else {
          this.setState({
            authUser,
            locale,
            currentTenant,
            areas: this.getOptions(areas, locale, currentTenant),
            loading: false
          });
        }
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getOptions(list: IAreas, locale: Locale, currentTenant: ITenant) {
    if (list && locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;

      return (list.data as IAreaData[]).map(item => ({
        value: item.id,
        label: getLocalized(item.attributes.title_multiloc, locale, currentTenantLocales),
      } as IOption));
    }

    return null;
  }

  handleYearOfBirthOnChange = (selectedYearOfBirth: IOption) => {
    this.setState({ selectedYearOfBirth });
  }

  handleGenderOnChange = (selectedGender: IOption) => {
    this.setState({ selectedGender });
  }

  handleAreaOnChange = (selectedArea: IOption) => {
    this.setState({ selectedArea });
  }

  handleOnSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();

    const { formatMessage } = this.props.intl;
    const { authUser, selectedYearOfBirth, selectedGender, selectedArea } = this.state;

    if (authUser) {
      try {
        this.setState({
          processing: true,
          unknownError: null
        });

        const updatedUserProps = _.omitBy({
          birthyear: (selectedYearOfBirth ? parseInt(selectedYearOfBirth.value, 10) : undefined),
          gender: (selectedGender ? selectedGender.value : undefined),
          domicile: (selectedArea ? selectedArea.value : undefined)
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

  skipStep = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.props.onCompleted();
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { authUser, currentTenant, areas, years, selectedYearOfBirth, selectedGender, selectedArea, loading, processing, unknownError } = this.state;

    if (!loading && authUser && currentTenant) {
      const { birthyear, domicile, gender } = currentTenant.data.attributes.settings.demographic_fields;

      return (
        <Form id="e2e-signup-step2" onSubmit={this.handleOnSubmit} noValidate={true}>

          {birthyear &&
            <FormElement>
              <Label value={formatMessage(messages.yearOfBirthLabel)} htmlFor="yearOfBirth" />
              <Select
                clearable={true}
                searchable={true}
                value={selectedYearOfBirth}
                placeholder={formatMessage(messages.yearOfBirthPlaceholder)}
                options={years}
                onChange={this.handleYearOfBirthOnChange}
              />
            </FormElement>
          }

          {gender &&
            <FormElement>
              <Label value={formatMessage(messages.genderLabel)} htmlFor="gender" />
              <Select
                clearable={true}
                value={selectedGender}
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
          }

          {domicile &&
            <FormElement>
              <Label value={formatMessage(messages.areaLabel)} htmlFor="area" />
              <Select
                clearable={true}
                value={selectedArea}
                placeholder={formatMessage(messages.areaPlaceholder)}
                options={areas}
                onChange={this.handleAreaOnChange}
              />
            </FormElement>
          }

          <FormElement>
            <ButtonWrapper>
              <Button
                id="e2e-signup-step2-button"
                size="2"
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
