import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// typings
import { API } from 'typings';

// i18n
import {  InjectedIntl } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { appLocalePairs } from 'i18n.js';
import messages from '../messages';

// components
import Input from 'components/UI/Input';
import Label from 'components/UI/Label';
import TextArea from 'components/UI/TextArea';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

// services
import {
  currentTenantStream,
  updateTenant,
  IUpdatedTenantProperties,
  ITenantData
} from 'services/tenant';

// Utils
import getSubmitState from 'utils/getSubmitState';

interface Props {
  intl: InjectedIntl;
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

class SettingsGeneralTab extends React.PureComponent<Props, State> {
  subscription: Rx.Subscription;

  constructor(props: Props) {
    super(props as any);
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
    const { errors, saved, attributesDiff } = this.state;
    const lang = this.props.intl.locale;
    const updatedLocales = _.get(this.state.attributesDiff, 'settings.core.locales');

    let tenantAttrs = this.state.tenant
      ? _.merge({}, this.state.tenant.attributes, this.state.attributesDiff)
      : _.merge({}, this.state.attributesDiff);

    // Prevent merging the arrays of locales
    if (updatedLocales) {
      tenantAttrs = _.set(tenantAttrs, 'settings.core.locales', updatedLocales);
    }

    return (
      <form onSubmit={this.save}>

        <Section>

          <SectionTitle>
            <FormattedMessage {...messages.titleBasic} />
          </SectionTitle>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.organizationName} values={{ type: _.get(tenantAttrs, 'settings.core.organization_type') }} />
            </Label>
            <Input
              type="text"
              id="organization_name"
              value={_.get(tenantAttrs, `settings.core.organization_name.${lang}`)}
              onChange={this.createChangeHandler(`settings.core.organization_name.${lang}`)}
            />
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.languages} values={{ type: _.get(tenantAttrs, 'settings.core.locales') }} />
            </Label>
            <MultipleSelect
              placeholder=""
              value={_.get(tenantAttrs, 'settings.core.locales')}
              onChange={this.createChangeHandler('settings.core.locales')}
              options={this.localeOptions()}
            />
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.metaTitle} />
            </Label>
            <Input
              type="text"
              id="meta_title"
              value={_.get(tenantAttrs, `settings.core.meta_title.${lang}`)}
              onChange={this.createChangeHandler(`settings.core.meta_title.${lang}`)}
            />
          </SectionField>

          <SectionField>
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
          </SectionField>

          <SubmitWrapper
            loading={this.state.loading}
            status={getSubmitState({ errors, saved, diff: attributesDiff })}
            messages={{
              buttonSave: messages.save,
              buttonError: messages.saveError,
              buttonSuccess: messages.saveSuccess,
              messageError: messages.saveErrorMessage,
              messageSuccess: messages.saveSuccessMessage,
            }}
          />

        </Section>

      </form>
    );
  }
}

export default injectIntl<Props>(SettingsGeneralTab);
