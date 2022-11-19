import React, { PureComponent } from 'react';
import { Subscription, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { get, has, isEmpty, omitBy } from 'lodash-es';

// components
import { Section, SectionTitle } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Branding from './Branding';
import ProjectHeader from './ProjectHeader';

// style
import styled, { withTheme } from 'styled-components';

// utils
import { convertUrlToUploadFileObservable } from 'utils/fileUtils';
import getSubmitState from './getSubmitState';
import { isNilOrError } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

// i18n
import { WrappedComponentProps } from 'react-intl';
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

// typings
import { UploadFile, Locale, Multiloc, CLErrors } from 'typings';

interface Props {
  theme: any;
}

interface IAttributesDiff {
  settings?: Partial<IAppConfigurationSettings>;
  logo?: UploadFile;
  style?: IAppConfigurationStyle;
}

export interface State {
  locale: Locale | null;
  attributesDiff: IAttributesDiff;
  tenant: IAppConfiguration | null;
  logo: UploadFile[] | null;
  loading: boolean;
  errors: CLErrors;
  saved: boolean;
  logoError: string | null;
  titleError: Multiloc;
  settings: Partial<IAppConfigurationSettings>;
  subtitleError: Multiloc;
}

// Styles and custom components
export const StyledSection = styled(Section)`
  margin-bottom 20px;
`;

export const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom 30px;
`;

class SettingsCustomizeTab extends PureComponent<
  Props & WrappedComponentProps,
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
      loading: false,
      errors: {},
      saved: false,
      logoError: null,
      titleError: {},
      subtitleError: {},
      settings: {},
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
            const settings = get(tenant, 'data.attributes.settings', {});

            const logo$ = logoUrl
              ? convertUrlToUploadFileObservable(logoUrl, null, null)
              : of(null);

            return combineLatest([logo$]).pipe(
              map(([tenantLogo]) => ({
                locale,
                tenant,
                tenantLogo,
                settings,
              }))
            );
          })
        )
        .subscribe(({ locale, tenant, tenantLogo, settings }) => {
          const logo = !isNilOrError(tenantLogo) ? [tenantLogo] : [];

          this.setState({ locale, tenant, logo, settings });
        }),
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
    const hasTitleError = !isEmpty(omitBy(this.state.titleError, isEmpty));
    const hasSubtitleError = !isEmpty(
      omitBy(this.state.subtitleError, isEmpty)
    );

    this.setState({ logoError });

    return !logoError && !hasTitleError && !hasSubtitleError;
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

        this.setState({
          loading: false,
          saved: true,
          errors: {},
          attributesDiff: {},
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
      const { logo, attributesDiff, logoError, errors, saved } = this.state;

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

          <ProjectHeader
            currentlyWorkingOnText={
              latestAppConfigCoreSettings?.['currently_working_on_text']
            }
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

export default withTheme(injectIntl(SettingsCustomizeTab));
