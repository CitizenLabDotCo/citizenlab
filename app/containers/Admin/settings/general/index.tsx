import React, { PureComponent, FormEvent } from 'react';
import { get, map, merge, set } from 'lodash-es';
import { Subscription } from 'rxjs';

// typings
import { CLError, Multiloc, IOption } from 'typings';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { appLocalePairs } from 'containers/App/constants';
import messages from '../messages';

// components
import InputMultiloc from 'components/UI/InputMultiloc';
import { Input, IconTooltip, Label } from 'cl2-component-library';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import {
  Section,
  SectionTitle,
  SectionField,
  SectionDescription,
} from 'components/admin/Section';

// services
import {
  currentAppConfigurationStream,
  updateTenant,
  IUpdatedAppConfigurationProperties,
  IAppConfigurationData,
} from 'services/appConfiguration';

// Utils
import getSubmitState from 'utils/getSubmitState';
import { isCLErrorJSON } from 'utils/errorUtils';

export interface Props {}

interface State {
  loading: boolean;
  saved: boolean;
  attributesDiff: IUpdatedAppConfigurationProperties;
  tenant: IAppConfigurationData | null;
  errors: {
    [fieldName: string]: CLError[];
  };
  hasUrlError: boolean;
}

class SettingsGeneralTab extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      attributesDiff: {},
      tenant: null,
      loading: false,
      errors: {},
      hasUrlError: false,
      saved: false,
    };
  }

  componentDidMount() {
    const currentTenant$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        this.setState({ tenant: currentTenant.data });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subsription) => subsription.unsubscribe());
  }

  handleCoreMultilocSettingOnChange = (propertyName: string) => (
    multiloc: Multiloc
  ) => {
    this.setState((state) => ({
      attributesDiff: {
        ...state.attributesDiff,
        settings: {
          ...get(state.attributesDiff, 'settings', {}),
          core: {
            ...get(state.attributesDiff, 'settings.core', {}),
            [propertyName]: multiloc,
          },
        },
      },
    }));
  };

  handleLocalesOnChange = (selectedLocaleOptions: IOption[]) => {
    this.setState((state) => ({
      attributesDiff: {
        ...state.attributesDiff,
        settings: {
          ...get(state.attributesDiff, 'settings', {}),
          core: {
            ...get(state.attributesDiff, 'settings.core', {}),
            locales: selectedLocaleOptions.map((option) => option.value),
          },
        },
      },
    }));
  };

  handleUrlOnChange = (url: string) => {
    this.setState((state) => ({
      hasUrlError: false,
      attributesDiff: {
        ...state.attributesDiff,
        settings: {
          ...get(state.attributesDiff, 'settings', {}),
          core: {
            ...get(state.attributesDiff, 'settings.core', {}),
            organization_site: url,
          },
        },
      },
    }));
  };

  save = (event: FormEvent<any>) => {
    event.preventDefault();

    const { tenant, attributesDiff } = this.state;

    if (tenant) {
      this.setState({
        loading: true,
        saved: false,
        hasUrlError: false,
        errors: {},
      });

      updateTenant(tenant.id, attributesDiff)
        .then(() => {
          this.setState({ saved: true, attributesDiff: {}, loading: false });
        })
        .catch((e) => {
          if (isCLErrorJSON(e)) {
            const errors = e.json.errors;
            this.setState({ errors, loading: false });
            // This error check uses an undocumented API from the backend.
            // Needs to be reimplemented to use frontend validation when converted to a Formik form.
            if (errors.settings && errors.settings.length > 0) {
              const foundUrlError = !!errors.settings.find(
                (error) => error.error.fragment === '#/core/organization_site'
              );
              if (foundUrlError) {
                this.setState({ hasUrlError: true });
              }
            }
          } else {
            this.setState({ errors: e, loading: false });
          }
        });
    }
  };

  localeOptions = () => {
    return map(appLocalePairs, (label, locale) => ({
      label,
      value: locale,
    }));
  };

  localesToOptions = (locales) => {
    return locales.map((locale) => ({
      value: locale,
      label: appLocalePairs[locale],
    }));
  };

  handleOrganizatioNameOnChange = this.handleCoreMultilocSettingOnChange(
    'organization_name'
  );

  render() {
    const { tenant } = this.state;

    if (tenant) {
      const {
        intl: { formatMessage },
      } = this.props;
      const { errors, saved, attributesDiff, hasUrlError } = this.state;
      const updatedLocales = get(attributesDiff, 'settings.core.locales');

      let tenantAttrs = tenant
        ? merge({}, tenant.attributes, attributesDiff)
        : merge({}, attributesDiff);

      // Prevent merging the arrays of locales
      if (updatedLocales) {
        tenantAttrs = set(tenantAttrs, 'settings.core.locales', updatedLocales);
      }

      const tenantLocales: string[] | null = get(
        tenantAttrs,
        'settings.core.locales',
        null
      );
      const organizationType: string | null = get(
        tenantAttrs,
        'settings.core.organization_type',
        null
      );
      const tenantSite: string | null = get(
        tenantAttrs,
        'settings.core.organization_site',
        null
      );
      const organizationNameMultiloc: Multiloc | null = get(
        tenantAttrs,
        'settings.core.organization_name',
        null
      );
      const localeOptions = this.localeOptions();
      const selectedLocaleOptions = this.localesToOptions(tenantLocales);

      return (
        <form onSubmit={this.save}>
          <Section>
            <SectionTitle>
              <FormattedMessage {...messages.titleBasic} />
            </SectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.subtitleBasic} />
            </SectionDescription>

            <SectionField>
              <InputMultiloc
                type="text"
                id="organization_name"
                label={
                  <FormattedMessage
                    {...messages.organizationName}
                    values={{ type: organizationType }}
                  />
                }
                valueMultiloc={organizationNameMultiloc}
                onChange={this.handleOrganizatioNameOnChange}
              />
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.languages} />
                <IconTooltip
                  content={<FormattedMessage {...messages.languagesTooltip} />}
                />
              </Label>
              <MultipleSelect
                placeholder=""
                value={selectedLocaleOptions}
                onChange={this.handleLocalesOnChange}
                options={localeOptions}
              />
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.urlTitle} />
                <IconTooltip
                  content={formatMessage(messages.urlTitleTooltip)}
                />
              </Label>
              <Input
                type="text"
                placeholder="https://..."
                onChange={this.handleUrlOnChange}
                value={tenantSite}
                error={hasUrlError ? formatMessage(messages.urlError) : null}
              />
            </SectionField>

            <SubmitWrapper
              loading={this.state.loading}
              status={getSubmitState({ errors, saved, diff: attributesDiff })}
              messages={{
                buttonSave: messages.save,
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

export default injectIntl<Props>(SettingsGeneralTab);
