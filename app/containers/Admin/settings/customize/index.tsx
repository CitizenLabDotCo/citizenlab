import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { merge, cloneDeep, forOwn, get, set, size, has, trim, isEmpty, omitBy } from 'lodash';

// components
import Label from 'components/UI/Label';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Toggle from 'components/UI/Toggle';
import ColorPickerInput from 'components/UI/ColorPickerInput';
import InputMultiloc from 'components/UI/InputMultiloc';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import FeatureFlag from 'components/FeatureFlag';

// style
import styled from 'styled-components';

// utils
import { convertUrlToFileObservable } from 'utils/imageTools';
import getSubmitState from 'utils/getSubmitState';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, updateTenant, IUpdatedTenantProperties, ITenant, ITenantSettings } from 'services/tenant';

// typings
import { API, ImageFile, Locale, Multiloc } from 'typings';

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
  errors: { [fieldName: string]: API.Error[] };
  saved: boolean;
  logoError: string | null;
  headerError: string | null;
  titleError: Multiloc;
  subtitleError: Multiloc;
};

class SettingsCustomizeTab extends React.PureComponent<Props & InjectedIntlProps, State> {
  titleMaxCharCount: number;
  subtitleMaxCharCount: number;
  subscriptions: Rx.Subscription[];

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
      subtitleError: {}
    };
    this.titleMaxCharCount = 45;
    this.subtitleMaxCharCount = 90;
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$
      ).switchMap(([locale, currentTenant]) => {
        return Rx.Observable.combineLatest(
          convertUrlToFileObservable(currentTenant.data.attributes.logo.large),
          convertUrlToFileObservable(currentTenant.data.attributes.header_bg.large),
        ).map(([currentTenantLogo, currentTenantHeaderBg]) => ({
          locale,
          currentTenant,
          currentTenantLogo,
          currentTenantHeaderBg
        }));
      }).subscribe(({ locale, currentTenant, currentTenantLogo, currentTenantHeaderBg }) => {
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

  handleUploadOnAdd = (name: 'logo' | 'header_bg') => (newImage: ImageFile) => {
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
        attributesDiff: set(cloneDeep(state.attributesDiff), `settings.core.header_title`, titleMultiloc),
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
        attributesDiff: set(cloneDeep(state.attributesDiff), `settings.core.header_slogan`, subtitleMultiloc),
      };
    });
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

            <StyledSectionField>
              <InputMultiloc
                type="text"
                valueMultiloc={get(tenantAttrs, `settings.core.header_title`)}
                label={<FormattedMessage {...messages.titleLabel} />}
                maxCharCount={this.titleMaxCharCount}
                onChange={this.handleTitleOnChange}
                errorMultiloc={titleError}
              />
            </StyledSectionField>

            <StyledSectionField>
              <InputMultiloc
                type="text"
                valueMultiloc={get(tenantAttrs, `settings.core.header_slogan`)}
                label={<FormattedMessage {...messages.subtitleLabel} />}
                maxCharCount={this.subtitleMaxCharCount}
                onChange={this.handleSubtitleOnChange}
                errorMultiloc={subtitleError}
              />
            </StyledSectionField>
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
