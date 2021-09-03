import React, { PureComponent } from 'react';
import { Subscription, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { forOwn, get, size, has, trim, isEmpty, omitBy } from 'lodash-es';

// components
import { Label, IconTooltip, ColorPickerInput } from 'cl2-component-library';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import {
  Section,
  SectionTitle,
  SectionField,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Warning from 'components/UI/Warning';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import ErrorMessage from 'components/UI/Error';
import {
  Setting,
  StyledToggle,
  ToggleLabel,
  LabelContent,
  LabelTitle,
  LabelDescription,
} from '../general';

// resources
import GetPage, { GetPageChildProps } from 'resources/GetPage';

// style
import styled, { withTheme } from 'styled-components';

// utils
import { convertUrlToUploadFileObservable } from 'utils/fileTools';
import getSubmitState from 'utils/getSubmitState';
import { calculateContrastRatio, hexToRgb } from 'utils/styleUtils';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// services
import { localeStream } from 'services/locale';
import {
  currentAppConfigurationStream,
  updateAppConfiguration,
  IUpdatedAppConfigurationProperties,
  IAppConfiguration,
  IAppConfigurationSettings,
} from 'services/appConfiguration';
import { updatePage } from 'services/pages';

// typings
import { CLError, UploadFile, Locale, Multiloc } from 'typings';

import { isCLErrorJSON } from 'utils/errorUtils';
import Outlet from 'components/Outlet';

export const ColorPickerSectionField = styled(SectionField)``;

const ContrastWarning = styled(Warning)`
  margin-top: 10px;
`;

export const WideSectionField = styled(SectionField)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
`;

const LabelTooltip = styled.div`
  display: flex;
  margin-right: 20px;
`;

interface DataProps {
  homepageInfoPage: GetPageChildProps;
}

interface Props extends DataProps {
  lang: string;
  theme: any;
}

interface IAttributesDiff {
  settings?: Partial<IAppConfigurationSettings>;
  homepage_info?: Multiloc;
  logo?: UploadFile;
  header_bg?: UploadFile;
}

interface State {
  locale: Locale | null;
  attributesDiff: IAttributesDiff;
  tenant: IAppConfiguration | null;
  logo: UploadFile[] | null;
  header_bg: UploadFile[] | null;
  colorPickerOpened: boolean;
  loading: boolean;
  errors: { [fieldName: string]: CLError[] };
  saved: boolean;
  logoError: string | null;
  headerError: string | null;
  titleError: Multiloc;
  settings: Partial<IAppConfigurationSettings>;
  subtitleError: Multiloc;
  contrastRatioWarning: {
    color_main: boolean;
    color_secondary: boolean;
    color_text: boolean;
  };
  contrastRatio: {
    color_main: number | null;
    color_secondary: number | null;
    color_text: number | null;
  };
}

type TenantColors = 'color_main' | 'color_secondary' | 'color_text';

class SettingsCustomizeTab extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  titleMaxCharCount: number;
  subtitleMaxCharCount: number;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      attributesDiff: {},
      tenant: null,
      logo: null,
      header_bg: null,
      colorPickerOpened: false,
      loading: false,
      errors: {},
      saved: false,
      logoError: null,
      headerError: null,
      titleError: {},
      subtitleError: {},
      settings: {},
      contrastRatioWarning: {
        color_main: false,
        color_secondary: false,
        color_text: false,
      },
      contrastRatio: {
        color_main: null,
        color_secondary: null,
        color_text: null,
      },
    };
    this.titleMaxCharCount = 45;
    this.subtitleMaxCharCount = 90;
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const tenant$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      combineLatest(locale$, tenant$)
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

            return combineLatest(logo$, headerBg$).pipe(
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

  handleUploadOnAdd = (name: 'logo' | 'header_bg' | 'favicon') => (
    newImage: UploadFile[]
  ) => {
    this.setState((state) => ({
      ...state,
      logoError: name === 'logo' ? null : state.logoError,
      headerError: name === 'header_bg' ? null : state.headerError,
      [name]: [newImage[0]],
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [name]: newImage[0].base64,
      },
    }));
  };

  handleUploadOnRemove = (name: 'logo' | 'header_bg') => () => {
    this.setState((state) => ({
      ...state,
      logoError: name === 'logo' ? null : state.logoError,
      headerError: name === 'header_bg' ? null : state.headerError,
      [name]: null,
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [name]: null,
      },
    }));
  };

  handleTitleOnChange = (titleMultiloc: Multiloc) => {
    const { formatMessage } = this.props.intl;
    const titleError = {} as Multiloc;

    forOwn(titleMultiloc, (title, locale) => {
      if (size(trim(title)) > 45) {
        titleError[locale] = formatMessage(messages.titleMaxCharError);
      }
    });

    this.handleCoreMultilocSettingOnChange('header_title')(titleMultiloc);
    this.setState((prevState) => ({
      ...prevState,
      titleError,
    }));
  };

  handleSubtitleOnChange = (subtitleMultiloc: Multiloc) => {
    const { formatMessage } = this.props.intl;
    const subtitleError = {} as Multiloc;

    forOwn(subtitleMultiloc, (subtitle, locale) => {
      if (size(trim(subtitle)) > 90) {
        subtitleError[locale] = formatMessage(messages.subtitleMaxCharError);
      }
    });

    this.handleCoreMultilocSettingOnChange('header_slogan')(subtitleMultiloc);
    this.setState((prevState) => ({
      ...prevState,
      subtitleError,
    }));
  };

  handleColorPickerOnChange = (colorName: TenantColors) => (
    hexColor: string
  ) => {
    this.setState((state) => {
      let contrastRatio: number | null = null;
      const rgbColor = hexToRgb(hexColor);

      if (rgbColor) {
        const { r, g, b } = rgbColor;
        contrastRatio = calculateContrastRatio([255, 255, 255], [r, g, b]);
      }

      return {
        contrastRatioWarning: {
          ...state.contrastRatioWarning,
          [colorName]: contrastRatio && contrastRatio < 4.5 ? true : false,
        },
        contrastRatio: {
          ...state.contrastRatio,
          [colorName]: contrastRatio,
        },
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...get(state.attributesDiff, 'settings', {}),
            core: {
              ...get(state.attributesDiff, 'settings.core', {}),
              [colorName]: hexColor,
            },
          },
        },
      };
    });
  };

  handleAppConfigurationStyleChange = (key: string) => (value: unknown) => {
    this.setState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          style: {
            ...get(state.attributesDiff, 'style', {}),
            [key]: value,
          },
        },
      };
    });
  };

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
    const { homepageInfoPage } = this.props;

    if (tenant && this.validate(tenant, attributesDiff)) {
      this.setState({ loading: true, saved: false });
      const homepageInfoPageMultiloc = attributesDiff.homepage_info;

      try {
        await updateAppConfiguration(
          attributesDiff as IUpdatedAppConfigurationProperties
        );

        if (!isNilOrError(homepageInfoPage)) {
          const homepageInfoPageId = homepageInfoPage.id;

          if (attributesDiff.homepage_info) {
            await updatePage(homepageInfoPageId, {
              body_multiloc: homepageInfoPageMultiloc,
            });
          }
        }
        this.setState({ loading: false, saved: true, attributesDiff: {} });
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

  handleColorPickerOnClick = () => {
    this.setState({ colorPickerOpened: true });
  };

  handleColorPickerOnClose = () => {
    this.setState({ colorPickerOpened: false });
  };

  handleCustomSectionMultilocOnChange = (
    homepageInfoPageMultiloc: Multiloc
  ) => {
    this.setState((state) => ({
      attributesDiff: {
        ...(state.attributesDiff || {}),
        homepage_info: homepageInfoPageMultiloc,
      },
    }));
  };

  handleCoreMultilocSettingOnChange = (propertyName: string) => (
    multiloc: Multiloc
  ) => {
    this.setState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...state.settings,
            ...get(state.attributesDiff, 'settings', {}),
            core: {
              ...get(state.settings, 'core', {}),
              ...get(state.attributesDiff, 'settings.core', {}),
              [propertyName]: multiloc,
            },
          },
        },
      };
    });
  };

  /*
  Below values are intentionally defined outside of render() for better performance
  because references stay the same this way, e.g. onClick={this.handleLogoOnAdd} vs onClick={this.handleUploadOnAdd('logo')},
  and therefore do not trigger unneeded rerenders which would otherwise noticably slow down text input in the form
  */
  handleLogoOnAdd = this.handleUploadOnAdd('logo');
  handleHeaderBgOnAdd = this.handleUploadOnAdd('header_bg');
  handleLogoOnRemove = this.handleUploadOnRemove('logo');
  handleHeaderBgOnRemove = this.handleUploadOnRemove('header_bg');

  handleToggleEventsPage = () => {
    const { tenant } = this.state;
    if (!tenant?.data.attributes.settings.events_page) return;

    const previousValue = this.getSetting('events_page.enabled');

    this.setState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...state.settings,
            ...get(state.attributesDiff, 'settings', {}),
            events_page: {
              ...get(state.settings, 'events_page', {}),
              ...get(state.attributesDiff, 'settings.events_page', {}),
              enabled: !previousValue,
            },
          },
        },
      };
    });
  };

  handleToggleEventsWidget = () => {
    const { tenant } = this.state;
    if (!tenant?.data.attributes.settings.events_widget) return;

    const previousValue = this.getSetting('events_widget.enabled');

    this.setState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...state.settings,
            ...get(state.attributesDiff, 'settings', {}),
            events_widget: {
              ...get(state.settings, 'events_widget', {}),
              ...get(state.attributesDiff, 'settings.events_widget', {}),
              enabled: !previousValue,
            },
          },
        },
      };
    });
  };

  render() {
    const { locale, tenant } = this.state;
    const { formatMessage } = this.props.intl;

    if (!isNilOrError(locale) && !isNilOrError(tenant)) {
      const { homepageInfoPage } = this.props;
      const {
        logo,
        header_bg,
        attributesDiff,
        logoError,
        headerError,
        titleError,
        subtitleError,
        errors,
        contrastRatioWarning,
        saved,
        contrastRatio,
      } = this.state;

      const latestAppConfigStyleSettings = {
        ...tenant.data.attributes,
        ...attributesDiff,
      }.style;

      const latestAppConfigCoreSettings = {
        ...tenant.data.attributes,
        ...attributesDiff,
      }.settings.core;

      return (
        <form onSubmit={this.save}>
          <Section key={'branding'}>
            <SectionTitle>
              <FormattedMessage {...messages.titleHomepageStyle} />
            </SectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.subtitleHomepageStyle} />
            </SectionDescription>

            <SubSectionTitle>
              <FormattedMessage {...messages.titlePlatformBranding} />
            </SubSectionTitle>

            {['color_main', 'color_secondary', 'color_text'].map(
              (colorName: TenantColors) => {
                const contrastRatioOfColor = contrastRatio[colorName];
                const contrastRatioWarningOfColor =
                  contrastRatioWarning[colorName];

                return (
                  <ColorPickerSectionField key={colorName}>
                    <Label>
                      <FormattedMessage
                        {...{
                          color_main: messages.color_primary,
                          color_secondary: messages.color_secondary,
                          color_text: messages.color_text,
                        }[colorName]}
                      />
                    </Label>
                    <ColorPickerInput
                      type="text"
                      value={this.getSetting(`core.${colorName}`)}
                      onChange={this.handleColorPickerOnChange(colorName)}
                    />
                    {contrastRatioWarningOfColor && contrastRatioOfColor && (
                      <ContrastWarning
                        text={
                          <FormattedMessage
                            {...messages.contrastRatioTooLow}
                            values={{
                              wcagLink: (
                                <a
                                  href="https://www.w3.org/TR/WCAG21/"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  WCAG 2.1 AA
                                </a>
                              ),
                              lineBreak: <br />,
                              contrastRatio: contrastRatioOfColor.toFixed(2),
                            }}
                          />
                        }
                      />
                    )}
                  </ColorPickerSectionField>
                );
              }
            )}

            <SectionField key={'logo'}>
              <Label htmlFor="tenant-logo-dropzone">
                <FormattedMessage {...messages.logo} />
              </Label>
              <ImagesDropzone
                id="tenant-logo-dropzone"
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                images={logo}
                imagePreviewRatio={1}
                maxImagePreviewWidth="150px"
                objectFit="contain"
                onAdd={this.handleLogoOnAdd}
                onRemove={this.handleLogoOnRemove}
                errorMessage={logoError}
              />
            </SectionField>
          </Section>

          <Section key={'header'}>
            <SubSectionTitle>
              <FormattedMessage {...messages.header} />
            </SubSectionTitle>
            <SectionField key={'header_bg'}>
              <Label htmlFor="landingpage-header-dropzone">
                <FormattedMessage {...messages.header_bg} />
                <IconTooltip
                  content={<FormattedMessage {...messages.header_bgTooltip} />}
                />
              </Label>
              <ImagesDropzone
                id="landingpage-header-dropzone"
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                images={header_bg}
                imagePreviewRatio={480 / 1440}
                maxImagePreviewWidth="500px"
                onAdd={this.handleHeaderBgOnAdd}
                onRemove={this.handleHeaderBgOnRemove}
                errorMessage={headerError}
              />
            </SectionField>
            <Outlet
              id="app.containers.Admin.settings.customize.fields"
              onChange={this.handleAppConfigurationStyleChange}
              theme={this.props.theme}
              latestAppConfigStyleSettings={latestAppConfigStyleSettings}
            />

            <SectionField>
              <InputMultilocWithLocaleSwitcher
                type="text"
                valueMultiloc={latestAppConfigCoreSettings?.['header_title']}
                label={
                  <LabelTooltip>
                    <FormattedMessage {...messages.bannerHeaderSignedOut} />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...messages.bannerHeaderSignedOutTooltip}
                        />
                      }
                    />
                  </LabelTooltip>
                }
                maxCharCount={this.titleMaxCharCount}
                onChange={this.handleTitleOnChange}
                errorMultiloc={titleError}
              />
            </SectionField>
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                type="text"
                valueMultiloc={latestAppConfigCoreSettings?.['header_slogan']}
                label={formatMessage(messages.bannerHeaderSignedOutSubtitle)}
                maxCharCount={this.subtitleMaxCharCount}
                onChange={this.handleSubtitleOnChange}
                errorMultiloc={subtitleError}
              />
            </SectionField>
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                type="text"
                valueMultiloc={
                  latestAppConfigCoreSettings?.[
                    'custom_onboarding_fallback_message'
                  ]
                }
                label={formatMessage(messages.bannerHeaderSignedIn)}
                onChange={this.handleCoreMultilocSettingOnChange(
                  'custom_onboarding_fallback_message'
                )}
              />
            </SectionField>
          </Section>

          <Section key={'project_header'}>
            <SubSectionTitle>
              <FormattedMessage {...messages.projects_header} />
              <IconTooltip
                content={formatMessage(messages.projects_header_tooltip)}
              />
            </SubSectionTitle>
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                type="text"
                valueMultiloc={
                  latestAppConfigCoreSettings?.['currently_working_on_text']
                }
                onChange={this.handleCoreMultilocSettingOnChange(
                  'currently_working_on_text'
                )}
              />
            </SectionField>
          </Section>

          <Section>
            <SubSectionTitle>
              <FormattedMessage {...messages.homePageCustomizableSection} />
            </SubSectionTitle>

            <WideSectionField>
              <QuillMultilocWithLocaleSwitcher
                id="custom-section"
                label={formatMessage(messages.customSectionLabel)}
                labelTooltipText={formatMessage(
                  messages.homePageCustomizableSectionTooltip
                )}
                valueMultiloc={
                  attributesDiff.homepage_info ||
                  get(homepageInfoPage, 'attributes.body_multiloc')
                }
                onChange={this.handleCustomSectionMultilocOnChange}
                withCTAButton
              />
              <ErrorMessage
                fieldName="homepage-info"
                apiErrors={errors['homepage-info']}
              />
            </WideSectionField>
          </Section>

          {tenant.data.attributes.settings?.events_page?.allowed && (
            <Section>
              <SectionTitle>
                <FormattedMessage {...messages.eventsSection} />
              </SectionTitle>

              <WideSectionField>
                <Setting>
                  <ToggleLabel>
                    <StyledToggle
                      checked={this.getSetting('events_page.enabled')}
                      onChange={this.handleToggleEventsPage}
                    />
                    <LabelContent>
                      <LabelTitle>
                        {formatMessage(messages.eventsPageSetting)}
                      </LabelTitle>
                      <LabelDescription>
                        {formatMessage(messages.eventsPageSettingDescription)}
                      </LabelDescription>
                    </LabelContent>
                  </ToggleLabel>
                </Setting>
              </WideSectionField>

              {tenant.data.attributes.settings?.events_widget?.allowed && (
                <Outlet
                  id="app.containers.Admin.settings.customize.EventsWidgetSwitch"
                  checked={this.getSetting('events_widget.enabled')}
                  onChange={this.handleToggleEventsWidget}
                  title={formatMessage(messages.eventsWidgetSetting)}
                  description={formatMessage(
                    messages.eventsWidgetSettingDescription
                  )}
                />
              )}
            </Section>
          )}

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
        </form>
      );
    }

    return null;
  }
}

const SettingsCustomizeTabWithHOCs = withTheme(
  injectIntl<Props>(SettingsCustomizeTab)
);

export default (inputProps: Props) => (
  <GetPage slug="homepage-info">
    {(page) => (
      <SettingsCustomizeTabWithHOCs homepageInfoPage={page} {...inputProps} />
    )}
  </GetPage>
);
