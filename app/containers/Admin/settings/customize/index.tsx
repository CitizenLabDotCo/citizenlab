import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// libraries
import { ImageFile } from 'react-dropzone';

// components
import { connect } from 'react-redux';
import { Checkbox } from 'semantic-ui-react';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Upload from 'components/UI/Upload';
import ColorPickerInput from 'components/UI/ColorPickerInput';
import Select from 'components/UI/Select';
import Input from 'components/UI/Input';
import FieldWrapper from 'components/admin/FieldWrapper';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// utils
import { getBase64, imageUrlToFileObservable } from 'utils/imageTools';

// i18n
import { FormattedMessage, injectIntl, InjectedIntlProps, InjectedIntl } from 'react-intl';
import messages from '../messages';

// services
import { localeStream } from 'services/locale';
import {
  currentTenantStream,
  updateTenant,
  IUpdatedTenantProperties,
  ITenant,
  ITenantSettings
} from 'services/tenant';

// typings
import { API } from 'typings.d';

interface IAttributesDiff {
  settings?: Partial<ITenantSettings>;
  logo?: ImageFile | undefined;
  header_bg?: ImageFile | undefined;
}

type Props  = {
  intl: InjectedIntl;
  lang: string;
  tFunc: Function;
};

type State  = {
  locale: string | null;
  attributesDiff: IAttributesDiff;
  currentTenant: ITenant | null;
  logo: File[] | ImageFile[] | null;
  header_bg: File[] | ImageFile[] | null;
  loading: boolean;
  errors: { [fieldName: string]: API.Error[] };
  saved: boolean;
  logoError: string | null;
  headerError: string | null;
};

class SettingsCustomizeTab extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      locale: null,
      attributesDiff: {},
      currentTenant: null,
      logo: null,
      header_bg: null,
      loading: false,
      errors: {},
      saved: false,
      logoError: null,
      headerError: null
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
          imageUrlToFileObservable(_.get(currentTenant, 'data.attributes.logo.large')),
          imageUrlToFileObservable(_.get(currentTenant, 'data.attributes.header_bg.large')),
        ).map(([currentTenantLogo, currentTenantHeaderBg]) => ({
          currentTenant,
          currentTenantLogo,
          currentTenantHeaderBg
        }));
      }).subscribe(({ currentTenant, currentTenantLogo, currentTenantHeaderBg }) => {
        this.setState((state) => {
          let logo: File[] | ImageFile[] | null = null;
          let header_bg: File[] | ImageFile[] | null = null;

          if (currentTenantLogo !== null && !_.has(state.attributesDiff, 'logo')) {
            logo = [currentTenantLogo];
          } else if (_.has(state.attributesDiff, 'logo')) {
            logo = (state.attributesDiff.logo && state.attributesDiff.logo !== null ? [state.attributesDiff.logo] : null);
          }

          if (currentTenantHeaderBg !== null && !_.has(state.attributesDiff, 'header_bg')) {
            header_bg = [currentTenantHeaderBg];
          } else if (_.has(state.attributesDiff, 'header_bg')) {
            header_bg = (state.attributesDiff.header_bg && state.attributesDiff.header_bg !== null ? [state.attributesDiff.header_bg] : null);
          }

          return { currentTenant, logo, header_bg };
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subsription => subsription.unsubscribe());
  }

  getSubmitState = (): 'disabled' | 'enabled' | 'error' | 'success' => {
    if (!_.isEmpty(this.state.errors)) {
      return 'error';
    } else if (this.state.saved && _.isEmpty(this.state.attributesDiff)) {
      return 'success';
    } else if (!this.state.saved && _.isEmpty(this.state.attributesDiff)) {
      return 'disabled';
    }

    return 'enabled';
  }

  handleUploadOnAdd = (name: 'logo' | 'header_bg') => (newImage: ImageFile) => {
    this.setState((state: State) => ({
      attributesDiff: {
        ...state.attributesDiff,
        [name]: newImage
      },
      [name]: [newImage]
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
    const { attributesDiff } = this.state;
    let newAttributesDiff = _.cloneDeep(attributesDiff);
    newAttributesDiff = _.set(newAttributesDiff, `settings.core.header_title.${locale}`, title);
    this.setState({ attributesDiff: newAttributesDiff });
  }

  handleSubtitleOnChange = (locale: string) => (subtitle: string) => {
    const { attributesDiff } = this.state;
    let newAttributesDiff = _.cloneDeep(attributesDiff);
    newAttributesDiff = _.set(newAttributesDiff, `settings.core.header_slogan.${locale}`, subtitle);
    this.setState({ attributesDiff: newAttributesDiff });
  }

  createToggleChangeHandler = (fieldPath) => {
    return (event, data?): void => {
      let newDiff = _.cloneDeep(this.state.attributesDiff);
      if (data && data.checked !== undefined) {
        newDiff = _.set(newDiff, fieldPath, data.checked);
      } else if (event && typeof(event) === 'string') {
        newDiff = _.set(newDiff, fieldPath, event);
      } else if (event && event.value) {
        newDiff = _.set(newDiff, fieldPath, event.value);
      } else {
        console.log(arguments);
      }

      this.setState({ attributesDiff: newDiff });
    };
  }

  validate = (currentTenant: ITenant, attributesDiff: IAttributesDiff) => {
    const { formatMessage } = this.props.intl;

    const hasRemoteLogo = _.has(currentTenant, 'data.attributes.logo.large');
    const localLogoIsNotSet = !_.has(attributesDiff, 'logo');
    const localLogoIsNull = !localLogoIsNotSet && attributesDiff.logo === null;
    const logoError = (!localLogoIsNull || (hasRemoteLogo && localLogoIsNotSet) ? null : formatMessage(messages.noLogo));

    const hasRemoteHeader = _.has(currentTenant, 'data.attributes.header_bg.large');
    const localHeaderIsNotSet = !_.has(attributesDiff, 'header_bg');
    const localHeaderIsNull = !localHeaderIsNotSet && attributesDiff.header_bg === null;
    const headerError = (!localHeaderIsNull || (hasRemoteHeader && localHeaderIsNotSet) ? null : formatMessage(messages.noHeader));

    this.setState({ logoError, headerError });

    return (!logoError && !headerError);
  }

  save = async (event) => {
    event.preventDefault();

    const { currentTenant, attributesDiff } = this.state;

    if (currentTenant && this.validate(currentTenant, attributesDiff)) {
      this.setState({ loading: true, saved: false });

      try {
        const updatedTenantProperties: IUpdatedTenantProperties = _.cloneDeep(attributesDiff as IUpdatedTenantProperties);

        if (_.has(attributesDiff, 'logo') && attributesDiff.logo !== null && attributesDiff.logo !== undefined) {
          updatedTenantProperties.logo = await getBase64(attributesDiff.logo);
        }

        if (_.has(attributesDiff, 'header_bg') && attributesDiff.header_bg !== null && attributesDiff.header_bg !== undefined) {
          updatedTenantProperties.header_bg = await getBase64(attributesDiff.header_bg);
        }

        await updateTenant(currentTenant.data.id, updatedTenantProperties);

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

  render() {
    const { locale, currentTenant } = this.state;

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const { formatMessage } = this.props.intl;
      const { logo, header_bg, attributesDiff, logoError, headerError } = this.state;
      const tenantAttrs = _.merge(_.cloneDeep(currentTenant.data.attributes), attributesDiff);

      return (
        <form onSubmit={this.save}>

          <h1><FormattedMessage {...messages.titleBranding} /></h1>
          <p><FormattedMessage {...messages.subTitleBranding} /></p>

          <FieldWrapper>
            <Label><FormattedMessage {...messages.mainColor} /></Label>
            <ColorPickerInput
              type="text"
              value={_.get(tenantAttrs, 'settings.core.color_main')}
              onChange={this.createToggleChangeHandler('settings.core.color_main')}
            />
          </FieldWrapper>

          <FieldWrapper key={'logo'}>
            <Label><FormattedMessage {...messages['logo']} /></Label>
            <Upload
              accept="image/jpg, image/jpeg, image/png, image/gif"
              maxItems={1}
              items={logo}
              onAdd={this.handleUploadOnAdd('logo')}
              onRemove={this.handleUploadOnRemove('logo')}
              placeholder={formatMessage(messages.uploadPlaceholder)}
              disallowDeletion={false}
              errorMessage={logoError}
            />
          </FieldWrapper>

          <FieldWrapper key={'header_bg'}>
            <Label><FormattedMessage {...messages['header_bg']} /></Label>
            <Upload
              accept="image/jpg, image/jpeg, image/png, image/gif"
              maxItems={1}
              items={header_bg}
              onAdd={this.handleUploadOnAdd('header_bg')}
              onRemove={this.handleUploadOnRemove('header_bg')}
              placeholder={formatMessage(messages.uploadPlaceholder)}
              disallowDeletion={false}
              errorMessage={headerError}
            />
          </FieldWrapper>

          <FieldWrapper key={'title'}>
            {currentTenantLocales.map((currentTenantLocale, index) => (
              <div key={index}>
                <Label><FormattedMessage {...messages.titleLabel} values={{ locale: currentTenantLocale.toUpperCase() }} /></Label>
                <Input
                  type="text"
                  value={_.get(tenantAttrs, `settings.core.header_title.${currentTenantLocale}`)}
                  onChange={this.handleTitleOnChange(currentTenantLocale)}
                />
              </div>
            ))}
          </FieldWrapper>

          <FieldWrapper key={'subtitle'}>
            {currentTenantLocales.map((currentTenantLocale, index) => (
              <div key={index}>
                <Label><FormattedMessage {...messages.subtitleLabel} values={{ locale: currentTenantLocale.toUpperCase() }} /></Label>
                <Input
                  type="text"
                  value={_.get(tenantAttrs, `settings.core.header_slogan.${currentTenantLocale}`)}
                  onChange={this.handleSubtitleOnChange(currentTenantLocale)}
                />
              </div>
            ))}
          </FieldWrapper>

          <h1><FormattedMessage {...messages.titleSignupFields} /></h1>
          <p><FormattedMessage {...messages.subTitleSignupFields} /></p>

          {['gender', 'domicile', 'birthyear', 'education'].map((fieldName, index) => {
            const fieldPath = `settings.demographic_fields.${fieldName}`;
            return (
              <FieldWrapper key={fieldName}>
                <Label><FormattedMessage {...messages[fieldName]} /></Label>
                <Checkbox
                  slider={true}
                  checked={_.get(tenantAttrs, fieldPath)}
                  onChange={this.createToggleChangeHandler(fieldPath)}
                />
              </FieldWrapper>
            );
          })}

          <SubmitWrapper
            loading={this.state.loading}
            status={this.getSubmitState()}
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
