import React, { PureComponent } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { merge, cloneDeep, forOwn, get, set, size, has, trim, isEmpty, omitBy } from 'lodash-es';

// components
import Label from 'components/UI/Label';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import ColorPickerInput from 'components/UI/ColorPickerInput';
import InputMultiloc from 'components/UI/InputMultiloc';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Warning from 'components/UI/Warning';

// style
import styled from 'styled-components';

// utils
import { convertUrlToFileObservable } from 'utils/imageTools';
import getSubmitState from 'utils/getSubmitState';
import { calculateContrastRatio, hexToRgb } from 'utils/styleUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, updateTenant, IUpdatedTenantProperties, ITenant, ITenantSettings } from 'services/tenant';

// typings
import { CLError, ImageFile, Locale, Multiloc } from 'typings';

const ColorPickerSectionField = styled(SectionField)`
`;

const ContrastWarning = styled(Warning)`
  margin-top: 10px;
`;

const StyledSectionField = styled(SectionField)`
  max-width: 500px;
`;

interface IAttributesDiff {
  settings?: Partial<ITenantSettings>;
  logo?: ImageFile | undefined;
  header_bg?: ImageFile | undefined;
}

type Props  = {
  lang: string;
};

type State  = {
  locale: Locale | null;
  attributesDiff: IAttributesDiff;
  currentTenant: ITenant | null;
  logo: ImageFile[] | null;
  header_bg: ImageFile[] | null;
  colorPickerOpened: boolean;
  loading: boolean;
  errors: { [fieldName: string]: CLError[] };
  saved: boolean;
  logoError: string | null;
  headerError: string | null;
  titleError: Multiloc;
  subtitleError: Multiloc;
  contrastRatioWarning: boolean;
};

class SettingsCustomizeTab extends PureComponent<Props & InjectedIntlProps, State> {
  titleMaxCharCount: number;
  subtitleMaxCharCount: number;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      attributesDiff: {},
      currentTenant: null,
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
      contrastRatioWarning: false,
    };
    this.titleMaxCharCount = 45;
    this.subtitleMaxCharCount = 90;
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      combineLatest(
        locale$,
        currentTenant$
      ).pipe(switchMap(([locale, currentTenant]) => {
        return combineLatest(
          convertUrlToFileObservable(currentTenant.data.attributes.logo.large),
          convertUrlToFileObservable(currentTenant.data.attributes.header_bg.large),
        ).pipe(map(([currentTenantLogo, currentTenantHeaderBg]) => ({
          locale,
          currentTenant,
          currentTenantLogo,
          currentTenantHeaderBg,
        })));
      })).subscribe(({ locale, currentTenant, currentTenantLogo, currentTenantHeaderBg }) => {
        const { attributesDiff } = this.state;
        let logo: ImageFile[] | null = null;
        let header_bg: ImageFile[] | null = null;

        if (currentTenantLogo !== null && !has(attributesDiff, 'logo')) {
          logo = [currentTenantLogo];
        } else if (has(attributesDiff, 'logo')) {
          logo = (attributesDiff.logo && attributesDiff.logo !== null ? [attributesDiff.logo] : null);
        }

        if (currentTenantHeaderBg !== null && !has(attributesDiff, 'header_bg')) {
          header_bg = [currentTenantHeaderBg];
        } else if (has(attributesDiff, 'header_bg')) {
          header_bg = (attributesDiff.header_bg && attributesDiff.header_bg !== null ? [attributesDiff.header_bg] : null);
        }

        this.setState({ locale, currentTenant, logo, header_bg });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subsription => subsription.unsubscribe());
  }

  handleUploadOnAdd = (name: 'logo' | 'header_bg' | 'favicon') => (newImage: ImageFile) => {
    this.setState((state) => ({
      ...state,
      [name]: [newImage],
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [name]: (newImage.base64 as string)
      }
    }));
  }

  handleUploadOnUpdate = (name: 'logo' | 'header_bg') => (updatedImages: ImageFile[]) => {
    this.setState((state) => ({
      ...state,
      [name]: updatedImages
    }));
  }

  handleUploadOnRemove = (name: 'logo' | 'header_bg') => () => {
    this.setState((state) => ({
      ...state,
      [name]: null,
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [name]: null
      }
    }));
  }

  handleTitleOnChange = (titleMultiloc: Multiloc) => {
    this.setState((state) => {
      const { formatMessage } = this.props.intl;
      const titleError = {} as Multiloc;

      forOwn(titleMultiloc, (title, locale) => {
        if (size(trim(title)) > 45) {
          titleError[locale] = formatMessage(messages.titleMaxCharError);
        }
      });

      return {
        titleError,
        attributesDiff: set(cloneDeep(state.attributesDiff), 'settings.core.header_title', titleMultiloc),
      };
    });
  }

  handleSubtitleOnChange = (subtitleMultiloc: Multiloc) => {
    this.setState((state) => {
      const { formatMessage } = this.props.intl;
      const subtitleError = {} as Multiloc;

      forOwn(subtitleMultiloc, (subtitle, locale) => {
        if (size(trim(subtitle)) > 90) {
          subtitleError[locale] = formatMessage(messages.subtitleMaxCharError);
        }
      });

      return {
        subtitleError,
        attributesDiff: set(cloneDeep(state.attributesDiff), 'settings.core.header_slogan', subtitleMultiloc),
      };
    });
  }

  handleColorPickerOnChange = (hexColor: string) => {
    const rgbColor = hexToRgb(hexColor);
    if (rgbColor) {
      const { r, g, b } = rgbColor;
      const contrastRatio = calculateContrastRatio([255, 255, 255], [r, g, b]);
      const contrastRatioWarning = contrastRatio < 4.50 ? true : false;
      this.setState({ contrastRatioWarning });
    }

    let newDiff = cloneDeep(this.state.attributesDiff);
    newDiff = set(newDiff, 'settings.core.color_main', hexColor);
    this.setState({ attributesDiff: newDiff });

  }

  validate = (currentTenant: ITenant, attributesDiff: IAttributesDiff) => {
    const { formatMessage } = this.props.intl;

    const hasRemoteLogo = has(currentTenant, 'data.attributes.logo.large');
    const localLogoIsNotSet = !has(attributesDiff, 'logo');
    const localLogoIsNull = !localLogoIsNotSet && attributesDiff.logo === null;
    const logoError = (!localLogoIsNull || (hasRemoteLogo && localLogoIsNotSet) ? null : formatMessage(messages.noLogo));

    const hasRemoteHeader = has(currentTenant, 'data.attributes.header_bg.large');
    const localHeaderIsNotSet = !has(attributesDiff, 'header_bg');
    const localHeaderIsNull = !localHeaderIsNotSet && attributesDiff.header_bg === null;
    const headerError = (!localHeaderIsNull || (hasRemoteHeader && localHeaderIsNotSet) ? null : formatMessage(messages.noHeader));

    const hasTitleError = !isEmpty(omitBy(this.state.titleError, isEmpty));
    const hasSubtitleError = !isEmpty(omitBy(this.state.subtitleError, isEmpty));

    this.setState({ logoError, headerError });

    return (!logoError && !headerError && !hasTitleError && !hasSubtitleError);
  }

  save = async (event) => {
    event.preventDefault();

    const { currentTenant, attributesDiff } = this.state;

    if (currentTenant && this.validate(currentTenant, attributesDiff)) {
      this.setState({ loading: true, saved: false });

      try {
        await updateTenant(currentTenant.data.id, attributesDiff as IUpdatedTenantProperties);
        this.setState({ loading: false, saved: true, attributesDiff: {} });
      } catch (error) {
        this.setState({ loading: false, errors: error.json.errors });
      }
    }
  }

  menuStyleOptions = () => ([
    {
      value: 'light',
      label: this.props.intl.formatMessage(messages.menuStyleLight),
    },
    {
      value: 'dark',
      label: this.props.intl.formatMessage(messages.menuStyleDark),
    },
  ])

  handleColorPickerOnClick = () => {
    this.setState({ colorPickerOpened: true });
  }

  handleColorPickerOnClose = () => {
    this.setState({ colorPickerOpened: false });
  }

  render() {
    const { locale,
      currentTenant,
      titleError,
      subtitleError,
      errors,
      contrastRatioWarning,
      saved } = this.state;

    if (locale && currentTenant) {
      const { formatMessage } = this.props.intl;
      const { logo, header_bg, attributesDiff, logoError, headerError } = this.state;
      const tenantAttrs = merge(cloneDeep(currentTenant.data.attributes), attributesDiff);

      return (
        <form onSubmit={this.save}>

          <Section key={'branding'}>
            <SectionTitle>
              <FormattedMessage {...messages.titleBranding} />
            </SectionTitle>

            <ColorPickerSectionField>
              <Label>
                <FormattedMessage {...messages.mainColor} />
              </Label>
              <ColorPickerInput
                type="text"
                value={get(tenantAttrs, 'settings.core.color_main')}
                onChange={this.handleColorPickerOnChange}
              />
              {contrastRatioWarning &&
                <ContrastWarning
                  text={
                    <FormattedMessage
                      {...messages.contrastRatioTooLow}
                    />
                  }
                />
              }
            </ColorPickerSectionField>

            <SectionField key={'logo'}>
              <Label><FormattedMessage {...messages['logo']} /></Label>
              <ImagesDropzone
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxNumberOfImages={1}
                maxImageFileSize={5000000}
                images={logo}
                imagePreviewRatio={1}
                maxImagePreviewWidth="150px"
                objectFit="contain"
                onAdd={this.handleUploadOnAdd('logo')}
                onUpdate={this.handleUploadOnUpdate('logo')}
                onRemove={this.handleUploadOnRemove('logo')}
                placeholder={formatMessage(messages.uploadPlaceholder)}
                errorMessage={logoError}
              />
            </SectionField>
          </Section>

          <Section key={'header'}>
            <SectionTitle>
              <FormattedMessage {...messages.header} />
            </SectionTitle>

            <SectionField key={'header_bg'}>
              <Label>
                <FormattedMessage {...messages['header_bg']} />
              </Label>
              <ImagesDropzone
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxNumberOfImages={1}
                maxImageFileSize={5000000}
                images={header_bg}
                imagePreviewRatio={480 / 1440}
                maxImagePreviewWidth="500px"
                onAdd={this.handleUploadOnAdd('header_bg')}
                onUpdate={this.handleUploadOnUpdate('header_bg')}
                onRemove={this.handleUploadOnRemove('header_bg')}
                placeholder={formatMessage(messages.uploadPlaceholder)}
                errorMessage={headerError}
              />
            </SectionField>

            <StyledSectionField>
              <InputMultiloc
                type="text"
                valueMultiloc={get(tenantAttrs, 'settings.core.header_title')}
                label={<FormattedMessage {...messages.headerTitleLabel} />}
                maxCharCount={this.titleMaxCharCount}
                onChange={this.handleTitleOnChange}
                errorMultiloc={titleError}
              />
            </StyledSectionField>

            <StyledSectionField>
              <InputMultiloc
                type="text"
                valueMultiloc={get(tenantAttrs, 'settings.core.header_slogan')}
                label={<FormattedMessage {...messages.headerSubtitleLabel} />}
                maxCharCount={this.subtitleMaxCharCount}
                onChange={this.handleSubtitleOnChange}
                errorMultiloc={subtitleError}
              />
            </StyledSectionField>
          </Section>

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

export default injectIntl<Props>(SettingsCustomizeTab);
