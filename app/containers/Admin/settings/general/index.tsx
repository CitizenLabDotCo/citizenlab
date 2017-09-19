// Libraries
import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { API } from 'typings.d';

// i18n
import { injectTFunc } from 'containers/T/utils';
import { FormattedMessage, injectIntl, InjectedIntl } from 'react-intl';
import { appLocalePairs } from 'i18n.js';
import messages from '../messages';

// Components
import Input from 'components/UI/Input';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import TextArea from 'components/UI/TextArea';
import MultipleSelect from 'components/UI/MultipleSelect';
import FieldWrapper from 'components/admin/FieldWrapper';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// Services
import {
  currentTenantStream,
  updateTenant,
  IUpdatedTenantProperties,
  ITenantData
} from 'services/tenant';

// Typing
interface Props {
  intl: InjectedIntl;
  tFunc: Function;
}

interface State {
  loading: boolean;
  saved: boolean;
  attributesDiff: IUpdatedTenantProperties;
  tenant: ITenantData | null;
  errors: {
    [fieldName: string]: API.Error[]
  };
}

class SettingsGeneralTab extends React.Component<Props, State> {
  subscription: Rx.Subscription;

  constructor() {
    super();
    this.state = {
      attributesDiff: {},
      tenant: null,
      loading: false,
      errors: {},
      saved: false,
    };
  }

  componentDidMount() {
    this.subscription = currentTenantStream().observable.subscribe((response) => {
      this.setState({ tenant: response.data });
    });
  }

  getSubmitState = (): 'disabled' | 'enabled' | 'error' | 'success' => {
    if (!_.isEmpty(this.state.errors)) {
      return 'error';
    }
    if (this.state.saved && _.isEmpty(this.state.attributesDiff)) {
      return 'success';
    }
    return _.isEmpty(this.state.attributesDiff) ? 'disabled' : 'enabled';
  }

  createChangeHandler = (fieldPath: string) => {
    return (value: any): void => {
      let newDiff = _.cloneDeep(this.state.attributesDiff);

      if (typeof(value) === 'string') {
        newDiff = _.set(newDiff, fieldPath, value);
      } else if (_.isArray(value)) {
        newDiff = _.set(newDiff, fieldPath, value.map((option) => option.value));
      }

      this.setState({ attributesDiff: newDiff });
    };
  }

  save = (e): void => {
    e.preventDefault();

    const { tenant, attributesDiff } = this.state;

    if (!tenant) {
      return;
    }

    this.setState({ loading: true, saved: false });

    updateTenant(tenant.id, attributesDiff)
    .then(() => {
      this.setState({ saved: true, attributesDiff: {}, loading: false });
    })
    .catch((e) => {
      this.setState({ errors: e.json.errors, loading: false });
    });
  }

  localeOptions = () => {
    return _.map(appLocalePairs, (label, locale) => ({
      label,
      value: locale,
    }));
  }

  localesToOptions = (locales) => {
    return locales.map((locale) => ({
      value: locale,
      label: appLocalePairs[locale],
    }));
  }

  render() {
    const lang = this.props.intl.locale;

    const tenantAttrs = this.state.tenant
    ? _.merge({}, this.state.tenant.attributes, this.state.attributesDiff)
    : _.merge({}, this.state.attributesDiff);

    return (
      <form onSubmit={this.save}>

        <h1><FormattedMessage {...messages.titleBasic} /></h1>
        <p><FormattedMessage {...messages.subTitleBasic} /></p>

        <FieldWrapper>
          <Label>
            <FormattedMessage {...messages.organizationName} values={{ type: _.get(tenantAttrs, 'settings.core.organization_type') }} />
          </Label>
          <Input
            type="text"
            id="organization_name"
            value={_.get(tenantAttrs, `settings.core.organization_name.${lang}`)}
            onChange={this.createChangeHandler(`settings.core.organization_name.${lang}`)}
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>
            <FormattedMessage {...messages.languages} values={{ type: _.get(tenantAttrs, 'settings.core.locales') }} />
          </Label>
          <MultipleSelect
            placeholder=""
            value={_.get(tenantAttrs, 'settings.core.locales')}
            onChange={this.createChangeHandler('settings.core.locales')}
            options={this.localeOptions()}
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>
            <FormattedMessage {...messages.metaTitle} />
          </Label>
          <Input
            type="text"
            id="meta_title"
            value={_.get(tenantAttrs, `settings.core.meta_title.${lang}`)}
            onChange={this.createChangeHandler(`settings.core.meta_title.${lang}`)}
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label>
            <FormattedMessage {...messages.metaDescription} />
          </Label>
          <TextArea
            name="meta_description"
            rows={5}
            value={_.get(tenantAttrs, `settings.core.meta_description.${lang}`)}
            onChange={this.createChangeHandler(`settings.core.meta_description.${lang}`)}
            error=""
          />
        </FieldWrapper>

        <SubmitWrapper
          loading={this.state.loading}
          status={this.getSubmitState()}
          messages={{
            buttonSave: messages.save,
            buttonError: messages.saveError,
            buttonSuccess: messages.saveSuccess,
            messageError: messages.saveErrorMessage,
            messageSuccess: messages.saveSuccessMessage,
          }}
        />

      </form>
    );
  }
}

export default injectIntl(injectTFunc(SettingsGeneralTab));
