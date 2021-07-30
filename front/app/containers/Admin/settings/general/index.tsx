import React, { PureComponent, FormEvent } from 'react';
import styled from 'styled-components';
import { get, map, merge, set } from 'lodash-es';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { CLError, Multiloc, IOption } from 'typings';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { appLocalePairs } from 'containers/App/constants';
import messages from '../messages';

// components
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import {
  Input,
  IconTooltip,
  Label,
  Success,
  Error,
  Toggle,
} from 'cl2-component-library';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import {
  Section,
  SectionTitle,
  SubSectionTitle,
  SectionField,
  SectionDescription,
} from 'components/admin/Section';
import Outlet from 'components/Outlet';

// services
import {
  currentAppConfigurationStream,
  updateAppConfiguration,
  IUpdatedAppConfigurationProperties,
  IAppConfigurationData,
  TAppConfigurationSetting,
} from 'services/appConfiguration';

// Utils
import getSubmitState from 'utils/getSubmitState';
import { isCLErrorJSON } from 'utils/errorUtils';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

export const StyledToggle = styled(Toggle)`
  margin-right: 15px;
`;

export const Setting = styled.div`
  margin-bottom: 20px;
`;

export const LabelTitle = styled.div`
  font-weight: bold;
`;

export const ToggleLabel = styled.label`
  display: flex;
`;

export const LabelDescription = styled.div``;
export const LabelContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export interface Props {}

interface State {
  loading: boolean;
  saved: boolean;
  attributesDiff: IUpdatedAppConfigurationProperties;
  appConfiguration: IAppConfigurationData | null;
  errors: {
    [fieldName: string]: CLError[];
  };
  hasUrlError: boolean;
  settingsUpdatedSuccessFully: boolean;
  settingsSavingError: boolean;
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
      appConfiguration: null,
      loading: false,
      errors: {},
      hasUrlError: false,
      saved: false,
      settingsUpdatedSuccessFully: false,
      settingsSavingError: false,
    };
  }

  componentDidMount() {
    const appConfiguration$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      appConfiguration$.subscribe((appConfiguration) => {
        this.setState({ appConfiguration: appConfiguration.data });
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

    const { appConfiguration, attributesDiff } = this.state;

    if (appConfiguration) {
      this.setState({
        loading: true,
        saved: false,
        hasUrlError: false,
        errors: {},
      });

      updateAppConfiguration(attributesDiff)
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

  onToggleBlockProfanitySetting = () => {
    const { appConfiguration } = this.state;

    if (
      !isNilOrError(appConfiguration) &&
      appConfiguration.attributes.settings.blocking_profanity
    ) {
      const oldProfanityBlockerEnabled =
        appConfiguration.attributes.settings.blocking_profanity.enabled;
      this.setState({
        settingsSavingError: false,
      });
      updateAppConfiguration({
        settings: {
          blocking_profanity: {
            enabled: !oldProfanityBlockerEnabled,
          },
        },
      })
        .then(() => {
          this.setState({
            settingsUpdatedSuccessFully: true,
          });
          setTimeout(() => {
            this.setState({
              settingsUpdatedSuccessFully: false,
            });
          }, 2000);
        })
        .catch((_error) => {
          this.setState({
            settingsSavingError: true,
          });
        });
    }
  };

  handleSettingChange = (settingName: TAppConfigurationSetting) => {
    const { appConfiguration } = this.state;

    if (!isNilOrError(appConfiguration)) {
      const setting = appConfiguration.attributes.settings[settingName];

      if (setting) {
        const oldSettingEnabled = setting.enabled;
        this.setState({
          settingsSavingError: false,
        });

        updateAppConfiguration({
          settings: {
            [settingName]: {
              enabled: !oldSettingEnabled,
            },
          },
        })
          .then(() => {
            this.setState({
              settingsUpdatedSuccessFully: true,
            });
            setTimeout(() => {
              this.setState({
                settingsUpdatedSuccessFully: false,
              });
            }, 2000);
          })
          .catch((_error) => {
            this.setState({
              settingsSavingError: true,
            });
          });
      }
    }
  };

  render() {
    const {
      appConfiguration,
      settingsSavingError,
      settingsUpdatedSuccessFully,
    } = this.state;
    const {
      intl: { formatMessage },
    } = this.props;

    if (appConfiguration) {
      const { errors, saved, attributesDiff, hasUrlError } = this.state;
      const updatedLocales = get(attributesDiff, 'settings.core.locales');

      let appConfigAttrs = appConfiguration
        ? merge({}, appConfiguration.attributes, attributesDiff)
        : merge({}, attributesDiff);

      // Prevent merging the arrays of locales
      if (updatedLocales) {
        appConfigAttrs = set(
          appConfigAttrs,
          'settings.core.locales',
          updatedLocales
        );
      }

      const appConfigLocales: string[] | null = get(
        appConfigAttrs,
        'settings.core.locales',
        null
      );
      const organizationType: string | null = get(
        appConfigAttrs,
        'settings.core.organization_type',
        null
      );
      const appConfigSite: string | null = get(
        appConfigAttrs,
        'settings.core.organization_site',
        null
      );
      const organizationNameMultiloc: Multiloc | null = get(
        appConfigAttrs,
        'settings.core.organization_name',
        null
      );
      const localeOptions = this.localeOptions();
      const selectedLocaleOptions = this.localesToOptions(appConfigLocales);
      const profanityBlockerSetting =
        appConfiguration.attributes.settings.blocking_profanity;

      return (
        <form onSubmit={this.save}>
          <SectionTitle>
            <FormattedMessage {...messages.titleBasic} />
          </SectionTitle>
          <StyledSection>
            <SubSectionTitle>
              <FormattedMessage {...messages.platformConfiguration} />
            </SubSectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.subtitleBasic} />
            </SectionDescription>

            <SectionField>
              <InputMultilocWithLocaleSwitcher
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
                value={appConfigSite}
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
          </StyledSection>
          <StyledSection>
            <SubSectionTitle>
              <FormattedMessage {...messages.contentModeration} />
            </SubSectionTitle>
            {profanityBlockerSetting && profanityBlockerSetting.allowed && (
              <Setting>
                <ToggleLabel>
                  <StyledToggle
                    checked={profanityBlockerSetting.enabled}
                    onChange={this.onToggleBlockProfanitySetting}
                  />
                  <LabelContent>
                    <LabelTitle>
                      {formatMessage(messages.profanityBlockerSetting)}
                    </LabelTitle>
                    <LabelDescription>
                      {formatMessage(
                        messages.profanityBlockerSettingDescription
                      )}
                    </LabelDescription>
                  </LabelContent>
                </ToggleLabel>
              </Setting>
            )}
            <Outlet
              id="app.containers.Admin.settings.general.form"
              onSettingChange={this.handleSettingChange}
            />
            {settingsUpdatedSuccessFully && (
              <Success
                showBackground
                text={formatMessage(messages.successfulUpdateSettings)}
              />
            )}
            {settingsSavingError && (
              <Error text={formatMessage(messages.settingsSavingError)} />
            )}
          </StyledSection>
        </form>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(SettingsGeneralTab);
