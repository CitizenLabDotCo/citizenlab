import * as React from 'react';
import { get, map } from 'lodash';
import * as Rx from 'rxjs/Rx';

// typings
import { API, Multiloc, IOption } from 'typings';

// i18n
import {  InjectedIntl } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import { appLocalePairs } from 'i18n.js';
import messages from '../messages';

// components
import InputMultiloc from 'components/UI/InputMultiloc';
import Label from 'components/UI/Label';
import TextAreaMultiloc from 'components/UI/TextAreaMultiloc';
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

export default class SettingsGeneralTab extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

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
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        this.setState({ tenant: currentTenant.data });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subsription => subsription.unsubscribe());
  }

  handleCoreMultilocSettingOnChange = (propertyName: string) => (multiloc: Multiloc) => {
    this.setState((state) => ({
      attributesDiff: {
        ...state.attributesDiff,
        settings: {
          ...get(state.attributesDiff, 'settings', {}),
          core: {
            ...get(state.attributesDiff, 'settings.core', {}),
            [propertyName]: multiloc
          }
        }
      }
    }));
  }

  handleLocalesOnChange = (selectedLocaleOptions: IOption[]) => {
    this.setState((state) => ({
      attributesDiff: {
        ...state.attributesDiff,
        settings: {
          ...get(state.attributesDiff, 'settings', {}),
          core: {
            ...get(state.attributesDiff, 'settings.core', {}),
            locales: selectedLocaleOptions.map(option => option.value)
          }
        }
      }
    }));
  }

  save = (event: React.FormEvent<any>) => {
    event.preventDefault();

    const { tenant, attributesDiff } = this.state;

    if (tenant) {
      this.setState({ loading: true, saved: false });

      updateTenant(tenant.id, attributesDiff).then(() => {
        this.setState({ saved: true, attributesDiff: {}, loading: false });
      }).catch((e) => {
        this.setState({ errors: e.json.errors, loading: false });
      });
    }
  }

  localeOptions = () => {
    return map(appLocalePairs, (label, locale) => ({
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
    const { tenant } = this.state;

    if (tenant) {
      const { errors, saved, attributesDiff } = this.state;
      const tenantAttrs = { ...get(tenant, 'attributes', {}), ...attributesDiff };
      const tenantLocales: string[] | null = get(tenantAttrs, 'settings.core.locales', null);
      const organizationType: string | null = get(tenantAttrs, 'settings.core.organization_type', null);
      const organizationNameMultiloc: Multiloc | null = get(tenantAttrs, 'settings.core.organization_name', null);
      const metaTitleMultiloc: Multiloc | null = get(tenantAttrs, 'settings.core.meta_title', null);
      const metaDescriptionMultiloc: Multiloc | null = get(tenantAttrs, 'settings.core.meta_description', null);
      const localeOptions = this.localeOptions();
      const selectedLocaleOptions = this.localesToOptions(tenantLocales);

      return (
        <form onSubmit={this.save}>
          <Section>
            <SectionTitle>
              <FormattedMessage {...messages.titleBasic} />
            </SectionTitle>

            <SectionField>
              <InputMultiloc
                type="text"
                id="organization_name"
                label={<FormattedMessage {...messages.organizationName} values={{ type: organizationType }} />}
                valueMultiloc={organizationNameMultiloc}
                onChange={this.handleCoreMultilocSettingOnChange('organization_name')}
              />
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.languages} />
              </Label>
              <MultipleSelect
                placeholder=""
                value={selectedLocaleOptions}
                onChange={this.handleLocalesOnChange}
                options={localeOptions}
              />
            </SectionField>

            <SectionField>
              <InputMultiloc
                type="text"
                id="meta_title"
                label={<FormattedMessage {...messages.metaTitle} />}
                valueMultiloc={metaTitleMultiloc}
                onChange={this.handleCoreMultilocSettingOnChange('meta_title')}
              />
            </SectionField>

            <SectionField>
              <TextAreaMultiloc
                label={<FormattedMessage {...messages.metaDescription} />}
                name="meta_description"
                rows={5}
                valueMultiloc={metaDescriptionMultiloc}
                onChange={this.handleCoreMultilocSettingOnChange('meta_description')}
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

    return null;
  }
}
