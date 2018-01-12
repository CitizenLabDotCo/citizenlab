import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { merge, cloneDeep, get, set, size, has, trim, isEmpty, omitBy } from 'lodash';

// components
import Label from 'components/UI/Label';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Toggle from 'components/UI/Toggle';
import ColorPickerInput from 'components/UI/ColorPickerInput';
import Input from 'components/UI/Input';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import FeatureFlag from 'components/FeatureFlag';

// style
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

// utils
import { convertUrlToFileObservable } from 'utils/imageTools';
import getSubmitState from 'utils/getSubmitState';

// i18n
import { InjectedIntlProps, InjectedIntl } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, updateTenant, IUpdatedTenantProperties, ITenant, ITenantSettings } from 'services/tenant';

// typings
import { API, ImageFile } from 'typings';

const StyledLabel = styled(Label)`
  display: flex;
  justify-content: space-between;
`;

const CharCount = styled.div`
  color: ${color('label')};
  font-size: ${fontSize('small')};
  font-weight: 400;

  &.error {
    color: red;
  }
`;

const ToggleWrapper = styled.div`
  width: 100%;
  max-width: 250px;
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  padding-bottom: 15px;

  &.first {
    border-top: none;
  }

  &.last {
    border-bottom: none;
  }
`;

const ToggleLabel = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
`;

const TitleInput = styled(SectionField)`
  max-width: 500px;
`;

interface IAttributesDiff {
  settings?: Partial<ITenantSettings>;
  logo?: ImageFile | undefined;
  header_bg?: ImageFile | undefined;
}

type Props  = {
  intl: InjectedIntl;
  lang: string;
  tFunc: Function;
};

type State  = {
  locale: string | null;
  attributesDiff: IAttributesDiff;
  currentTenant: ITenant | null;
  logo: ImageFile[] | null;
  header_bg: ImageFile[] | null;
  colorPickerOpened: boolean;
  loading: boolean;
  errors: { [fieldName: string]: API.Error[] };
  saved: boolean;
  logoError: string | null;
  headerError: string | null;
  titleError: { [key: string]: string | null };
  subtitleError: { [key: string]: string | null };
};

class SettingsCustomizeTab extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
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
      subtitleError: {}
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      locale$.subscribe(locale => this.setState({ locale })),

      currentTenant$.switchMap((currentTenant) => {
        return Rx.Observable.combineLatest(
          convertUrlToFileObservable(currentTenant.data.attributes.logo.large),
          convertUrlToFileObservable(currentTenant.data.attributes.header_bg.large),
        ).map(([currentTenantLogo, currentTenantHeaderBg]) => ({
          currentTenant,
          currentTenantLogo,
          currentTenantHeaderBg
        }));
      }).subscribe(({ currentTenant, currentTenantLogo, currentTenantHeaderBg }) => {
        this.setState((state) => {
          const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
          const titleCharCount = {};
          const subtitleCharCount = {};
          let logo: ImageFile[] | null = null;
          let header_bg: ImageFile[] | null = null;

          if (currentTenantLogo !== null && !has(state.attributesDiff, 'logo')) {
            logo = [currentTenantLogo];
          } else if (has(state.attributesDiff, 'logo')) {
            logo = (state.attributesDiff.logo && state.attributesDiff.logo !== null ? [state.attributesDiff.logo] : null);
          }

          if (currentTenantHeaderBg !== null && !has(state.attributesDiff, 'header_bg')) {
            header_bg = [currentTenantHeaderBg];
          } else if (has(state.attributesDiff, 'header_bg')) {
            header_bg = (state.attributesDiff.header_bg && state.attributesDiff.header_bg !== null ? [state.attributesDiff.header_bg] : null);
          }

          if (currentTenant && currentTenantLocales && currentTenantLocales.length > 0) {
            currentTenantLocales.forEach((currentTenantLocale) => {
              titleCharCount[currentTenantLocale] = size(get(currentTenant, `data.attributes.settings.core.header_title.${currentTenantLocale}`));
              subtitleCharCount[currentTenantLocale] = size(get(currentTenant, `data.attributes.settings.core.header_slogan.${currentTenantLocale}`));
            });
          }

          return { currentTenant, logo, header_bg, titleCharCount, subtitleCharCount };
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subsription => subsription.unsubscribe());
  }

  handleUploadOnAdd = (name: 'logo' | 'header_bg') => (newImage: ImageFile) => {
    this.setState((state: State) => ({
      attributesDiff: {
        ...state.attributesDiff,
        [name]: newImage.base64
      },
      [name]: [newImage]
    }));
  }

  handleUploadOnUpdate = (name: 'logo' | 'header_bg') => (updatedImages: ImageFile[]) => {
    this.setState((state: State) => ({
      [name]: updatedImages
    }));
  }

  handleUploadOnRemove = (name: 'logo' | 'header_bg') => (image: ImageFile) => {
    this.setState((state: State) => ({
      attributesDiff: {
        ...state.attributesDiff,
        [name]: null
      },
      [name]: null
    }));
  }

  handleTitleOnChange = (locale: string) => (title: string) => {
    const { formatMessage } = this.props.intl;
    const { attributesDiff } = this.state;
    const titleError = { ...this.state.titleError, [locale]: null };
    let newAttributesDiff = cloneDeep(attributesDiff);
    newAttributesDiff = set(newAttributesDiff, `settings.core.header_title.${locale}`, title);

    this.setState((state) => ({
      attributesDiff: newAttributesDiff,
      titleError: {
        ...state.titleError,
        [locale]: size(trim(title)) > 45 ? formatMessage(messages.titleMaxCharError) : null
      }
    }));
  }

  handleSubtitleOnChange = (locale: string) => (subtitle: string) => {
    const { formatMessage } = this.props.intl;
    const { attributesDiff } = this.state;
    let newAttributesDiff = cloneDeep(attributesDiff);
    newAttributesDiff = set(newAttributesDiff, `settings.core.header_slogan.${locale}`, subtitle);

    this.setState((state) => ({
      attributesDiff: newAttributesDiff,
      subtitleError: {
        ...state.subtitleError,
        [locale]: size(trim(subtitle)) > 90 ? formatMessage(messages.subtitleMaxCharError) : null
      }
    }));
  }

  handleColorPickerOnChange = (color: string) => {
    let newDiff = cloneDeep(this.state.attributesDiff);
    newDiff = set(newDiff, 'settings.core.color_main', color);
    this.setState({ attributesDiff: newDiff });
  }

  handleOnToggle = (fieldPath: string, checked: boolean) => () => {
    let newDiff = cloneDeep(this.state.attributesDiff);
    newDiff = set(newDiff, fieldPath, !checked);
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
    const { locale, currentTenant, titleError, subtitleError, errors, saved } = this.state;

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const hasMultipleTenantLocales = (currentTenant.data.attributes.settings.core.locales.length > 1);
      const { formatMessage } = this.props.intl;
      const { logo, header_bg, attributesDiff, logoError, headerError } = this.state;
      const tenantAttrs = merge(cloneDeep(currentTenant.data.attributes), attributesDiff);

      return (
        <form onSubmit={this.save}>

          <Section key={'branding'}>
            <SectionTitle>
              <FormattedMessage {...messages.titleBranding} />
            </SectionTitle>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.mainColor} />
              </Label>
              <ColorPickerInput
                type="text"
                value={get(tenantAttrs, 'settings.core.color_main')}
                onChange={this.handleColorPickerOnChange}
              />
            </SectionField>

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

            {currentTenantLocales.map((currentTenantLocale, index) => {
              const capitalizedTenantLocale = (hasMultipleTenantLocales ? currentTenantLocale.toUpperCase() : '');
              const titleSize = size(get(tenantAttrs, `settings.core.header_title.${currentTenantLocale}`));

              return (
                <TitleInput key={index}>
                  <StyledLabel>
                    <FormattedMessage
                      {...messages.titleLabel}
                      values={{ locale: capitalizedTenantLocale }}
                    />
                    <CharCount className={titleError[currentTenantLocale] ? 'error' : ''}>
                      {titleSize}/45
                    </CharCount>
                  </StyledLabel>
                  <Input
                    type="text"
                    value={get(tenantAttrs, `settings.core.header_title.${currentTenantLocale}`)}
                    onChange={this.handleTitleOnChange(currentTenantLocale)}
                    error={titleError[currentTenantLocale]}
                  />
                </TitleInput>
              );
            })}

            {currentTenantLocales.map((currentTenantLocale, index) => {
              const capitalizedTenantLocale = (hasMultipleTenantLocales ? currentTenantLocale.toUpperCase() : '');
              const subtitleSize = size(get(tenantAttrs, `settings.core.header_slogan.${currentTenantLocale}`));

              return (
                <TitleInput key={index}>
                  <StyledLabel>
                    <FormattedMessage
                      {...messages.subtitleLabel}
                      values={{ locale: capitalizedTenantLocale }}
                    />
                    <CharCount className={subtitleError[currentTenantLocale] ? 'error' : ''}>
                      {subtitleSize}/90
                    </CharCount>
                  </StyledLabel>
                  <Input
                    type="text"
                    value={get(tenantAttrs, `settings.core.header_slogan.${currentTenantLocale}`)}
                    onChange={this.handleSubtitleOnChange(currentTenantLocale)}
                    error={subtitleError[currentTenantLocale]}
                  />
                </TitleInput>
              );
            })}
          </Section>

          <Section key={'signup_fields'} className={'last'}>
            <SectionTitle>
              <FormattedMessage {...messages.titleSignupFields} />
            </SectionTitle>

            <FeatureFlag name="demographic_fields">
              <SectionField>
                {['gender', 'domicile', 'birthyear'].map((fieldName, index) => {
                  const fieldPath = `settings.demographic_fields.${fieldName}`;
                  const checked = get(tenantAttrs, fieldPath) as boolean;
                  const first = (index === 0 && 'first');
                  const last = (index === 2 && 'last');

                  return (
                    <ToggleWrapper key={fieldName} className={`${first} ${last}`} >
                      <ToggleLabel>
                        <FormattedMessage {...messages[fieldName]} />
                      </ToggleLabel>
                      <Toggle
                        checked={checked}
                        disabled={false}
                        onToggle={this.handleOnToggle(fieldPath, checked)}
                      />
                    </ToggleWrapper>
                  );
                })}
              </SectionField>
            </FeatureFlag>
          </Section>

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

        </form>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(SettingsCustomizeTab);
