import React, { PureComponent } from 'react';
import { Subscription, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { get, has, isEmpty, omitBy } from 'lodash-es';

// components
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Branding from './Branding';
import Header from './Header';
import ProjectHeader from './ProjectHeader';
import HomepageCustomizableSection from './HomepageCustomizableSection';
import Events from './Events';
import AllInput from './AllInput';

// style
import { withTheme } from 'styled-components';

// utils
import { convertUrlToUploadFileObservable } from 'utils/fileUtils';
import getSubmitState from './getSubmitState';
import { isNilOrError } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import sharedSettingsMessages from '../messages';

// services
import { localeStream } from 'services/locale';
import {
  currentAppConfigurationStream,
  updateAppConfiguration,
  IAppConfigurationStyle,
  IAppConfiguration,
  IAppConfigurationSettings,
  IUpdatedAppConfigurationProperties,
  TAppConfigurationSetting,
} from 'services/appConfiguration';
import { toggleEvents, toggleAllInput } from 'services/navbar';

// typings
import { UploadFile, Locale, Multiloc, CLErrors } from 'typings';

interface Props {
  lang: string;
  theme: any;
}

interface IAttributesDiff {
  settings?: Partial<IAppConfigurationSettings>;
  homepage_info_multiloc?: Multiloc;
  logo?: UploadFile;
  header_bg?: UploadFile;
  style?: IAppConfigurationStyle;
}

export interface State {
  locale: Locale | null;
  attributesDiff: IAttributesDiff;
  tenant: IAppConfiguration | null;
  logo: UploadFile[] | null;
  header_bg: UploadFile[] | null;
  loading: boolean;
  errors: CLErrors;
  saved: boolean;
  logoError: string | null;
  headerError: string | null;
  titleError: Multiloc;
  settings: Partial<IAppConfigurationSettings>;
  subtitleError: Multiloc;
  newEventsNavbarItemEnabled: boolean | null;
  newAllInputNavbarItemEnabled: boolean | null;
}

class SettingsCustomizeTab extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      attributesDiff: {},
      tenant: null,
      logo: null,
      header_bg: null,
      loading: false,
      errors: {},
      saved: false,
      logoError: null,
      headerError: null,
      titleError: {},
      subtitleError: {},
      settings: {},
      newEventsNavbarItemEnabled: null,
      newAllInputNavbarItemEnabled: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const tenant$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      combineLatest([locale$, tenant$])
        .pipe(
          switchMap(([locale, tenant]) => {
            const logoUrl = get(tenant, 'data.attributes.logo.large', null);
            const headerUrl = get(
              tenant,
              'data.attributes.header_bg.large',
              null
            );
            const settings = get(tenant, 'data.attributes.settings', {});

            const logo$ = logoUrl
              ? convertUrlToUploadFileObservable(logoUrl, null, null)
              : of(null);
            const headerBg$ = headerUrl
              ? convertUrlToUploadFileObservable(headerUrl, null, null)
              : of(null);

            return combineLatest([logo$, headerBg$]).pipe(
              map(([tenantLogo, tenantHeaderBg]) => ({
                locale,
                tenant,
                tenantLogo,
                tenantHeaderBg,
                settings,
              }))
            );
          })
        )
        .subscribe(
          ({ locale, tenant, tenantLogo, tenantHeaderBg, settings }) => {
            const logo = !isNilOrError(tenantLogo) ? [tenantLogo] : [];
            const header_bg = !isNilOrError(tenantHeaderBg)
              ? [tenantHeaderBg]
              : [];
            this.setState({ locale, tenant, logo, header_bg, settings });
          }
        ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subsription) => subsription.unsubscribe());
  }

  validate = (tenant: IAppConfiguration, attributesDiff: IAttributesDiff) => {
    const { formatMessage } = this.props.intl;
    const hasRemoteLogo = has(tenant, 'data.attributes.logo.large');
    const localLogoIsNotSet = !has(attributesDiff, 'logo');
    const localLogoIsNull = !localLogoIsNotSet && attributesDiff.logo === null;
    const logoError =
      !localLogoIsNull || (hasRemoteLogo && localLogoIsNotSet)
        ? null
        : formatMessage(messages.noLogo);
    const hasRemoteHeader = has(tenant, 'data.attributes.header_bg.large');
    const localHeaderIsNotSet = !has(attributesDiff, 'header_bg');
    const localHeaderIsNull =
      !localHeaderIsNotSet && attributesDiff.header_bg === null;
    const headerError =
      !localHeaderIsNull || (hasRemoteHeader && localHeaderIsNotSet)
        ? null
        : formatMessage(messages.noHeader);
    const hasTitleError = !isEmpty(omitBy(this.state.titleError, isEmpty));
    const hasSubtitleError = !isEmpty(
      omitBy(this.state.subtitleError, isEmpty)
    );

    this.setState({ logoError, headerError });

    return !logoError && !headerError && !hasTitleError && !hasSubtitleError;
  };

  save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { tenant, attributesDiff } = this.state;

    if (tenant && this.validate(tenant, attributesDiff)) {
      this.setState({ loading: true, saved: false });

      try {
        if (!isEmpty(attributesDiff)) {
          await updateAppConfiguration(
            // to remove type casting and have correct types instead
            attributesDiff as IUpdatedAppConfigurationProperties
          );
        }

        const { newEventsNavbarItemEnabled, newAllInputNavbarItemEnabled } =
          this.state;

        if (newEventsNavbarItemEnabled !== null) {
          await toggleEvents({ enabled: newEventsNavbarItemEnabled });
        }

        if (newAllInputNavbarItemEnabled !== null) {
          await toggleAllInput({ enabled: newAllInputNavbarItemEnabled });
        }

        this.setState({
          loading: false,
          saved: true,
          errors: {},
          attributesDiff: {},
          newEventsNavbarItemEnabled: null,
          newAllInputNavbarItemEnabled: null,
        });
      } catch (error) {
        if (isCLErrorJSON(error)) {
          this.setState({ loading: false, errors: error.json.errors });
        } else {
          this.setState({ loading: false, errors: error });
        }
      }
    }
  };

  getSetting = (setting: string) => {
    return (
      get(this.state.attributesDiff, `settings.${setting}`) ??
      get(this.state.tenant, `data.attributes.settings.${setting}`)
    );
  };

  handleSettingOnChange =
    (settingName: TAppConfigurationSetting) =>
    (settingKey: string, newSettingValue: any) => {
      this.setState((state) => {
        return {
          attributesDiff: {
            ...state.attributesDiff,
            settings: {
              ...state.settings,
              ...get(state.attributesDiff, 'settings', {}),
              [settingName]: {
                ...get(state.settings, settingName, {}),
                ...get(state.attributesDiff, `settings.${settingName}`, {}),
                [settingKey]: newSettingValue,
              },
            },
          },
        };
      });
    };

  render() {
    const { locale, tenant } = this.state;

    if (!isNilOrError(locale) && !isNilOrError(tenant)) {
      const homepageInfoPage = tenant.data.attributes.homepage_info_multiloc;

      const {
        logo,
        header_bg,
        attributesDiff,
        logoError,
        headerError,
        titleError,
        subtitleError,
        errors,
        saved,
        newEventsNavbarItemEnabled,
        newAllInputNavbarItemEnabled,
      } = this.state;

      const latestAppConfigStyleSettings = {
        ...tenant.data.attributes.style,
        ...attributesDiff.style,
      };

      const latestAppConfigSettings = {
        ...tenant.data.attributes,
        ...attributesDiff,
      }.settings;
      const latestAppConfigCoreSettings = latestAppConfigSettings.core;

      const setState = this.setState.bind(this);
      const getSetting = this.getSetting.bind(this);

      return (
        <form onSubmit={this.save}>
          <Branding
            logo={logo}
            logoError={logoError}
            setParentState={setState}
            getSetting={getSetting}
          />

          <Header
            header_bg={header_bg}
            headerError={headerError}
            titleError={titleError}
            subtitleError={subtitleError}
            latestAppConfigStyleSettings={latestAppConfigStyleSettings}
            latestAppConfigSettings={latestAppConfigSettings}
            setParentState={setState}
            getSetting={getSetting}
            handleSettingOnChange={this.handleSettingOnChange}
            errors={errors}
          />

          <ProjectHeader
            currentlyWorkingOnText={
              latestAppConfigCoreSettings?.['currently_working_on_text']
            }
            setParentState={setState}
          />

          <HomepageCustomizableSection
            homepageInfoMultiloc={
              attributesDiff.homepage_info_multiloc || homepageInfoPage
            }
            homepageInfoErrors={errors.homepage_info}
            setParentState={setState}
          />

          <Events
            newNavbarItemEnabled={newEventsNavbarItemEnabled}
            setParentState={setState}
            getSetting={getSetting}
          />

          <AllInput
            newNavbarItemEnabled={newAllInputNavbarItemEnabled}
            setParentState={setState}
          />

          <SubmitWrapper
            loading={this.state.loading}
            status={getSubmitState({ errors, saved, state: this.state })}
            messages={{
              buttonSave: sharedSettingsMessages.save,
              buttonSuccess: sharedSettingsMessages.saveSuccess,
              messageError: sharedSettingsMessages.saveErrorMessage,
              messageSuccess: sharedSettingsMessages.saveSuccessMessage,
            }}
          />
        </form>
      );
    }

    return null;
  }
}

export default withTheme(injectIntl<Props>(SettingsCustomizeTab));
