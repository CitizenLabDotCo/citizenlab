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
import FieldWrapper from 'components/admin/FieldWrapper';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// utils
import { getBase64, imageUrlToFileObservable } from 'utils/imageTools';

// i18n
import { FormattedMessage, injectIntl, InjectedIntlProps, InjectedIntl } from 'react-intl';
import messages from '../messages';

// services
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
  header_bg?: string;
}

type Props  = {
  intl: InjectedIntl;
  lang: string;
  tFunc: Function;
};

type State  = {
  attributesDiff: IAttributesDiff;
  currentTenant: ITenant | null;
  logo: File[] | ImageFile[] | null;
  loading: boolean;
  errors: { [fieldName: string]: API.Error[] };
  saved: boolean;
  logoError: string | null;
};

class SettingsCustomizeTab extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      attributesDiff: {},
      currentTenant: null,
      logo: null,
      loading: false,
      errors: {},
      saved: false,
      logoError: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.switchMap((currentTenant) => {
        return imageUrlToFileObservable(_.get(currentTenant, 'data.attributes.logo.large')).map((currentTenantLogo) => ({
          currentTenant,
          currentTenantLogo
        }));
      }).subscribe(({ currentTenant, currentTenantLogo }) => {
        this.setState((state) => {
          let logo: File[] | ImageFile[] | null = null;

          if (currentTenantLogo !== null && !_.has(state.attributesDiff, 'logo')) {
            logo = [currentTenantLogo];
          } else if (_.has(state.attributesDiff, 'logo')) {
            logo = (state.attributesDiff.logo ? [state.attributesDiff.logo] : null);
          }

          return { currentTenant, logo };
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

  handleUploadOnAdd = (name: string) => async (newImage: ImageFile) => {
    this.setState((state: State) => ({
      attributesDiff: {
        ...state.attributesDiff,
        [name]: newImage
      },
      [name]: [newImage]
    }));
  }

  handleUploadOnRemove = (name: string) => (image: ImageFile) => {
    this.setState((state: State) => ({
      attributesDiff: {
        ...state.attributesDiff,
        [name]: null
      },
      [name]: null
    }));
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

  save = async (event) => {
    event.preventDefault();

    const { formatMessage } = this.props.intl;
    const { currentTenant, attributesDiff } = this.state;

    // first reset any error messages
    this.setState({ logoError: null });

    if (_.has(attributesDiff, 'logo') && attributesDiff.logo === null) {
      this.setState({ logoError: formatMessage(messages.noLogo) });
    } else if (currentTenant) {
      const { attributesDiff } = this.state;

      this.setState({ loading: true, saved: false });

      try {
        let updatedTenantProperties: IUpdatedTenantProperties = attributesDiff as IUpdatedTenantProperties;

        if (attributesDiff.logo && attributesDiff.logo) {
          const base64Logo = await getBase64(attributesDiff.logo);

          updatedTenantProperties = {
            ...attributesDiff,
            logo: base64Logo
          };
        }

        const updatedTenant = await updateTenant(currentTenant.data.id, updatedTenantProperties);

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
    const { currentTenant } = this.state;

    if (currentTenant) {
      const { formatMessage } = this.props.intl;
      const { logo, attributesDiff, logoError } = this.state;
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
              accept="image/*"
              maxItems={1}
              items={logo}
              onAdd={this.handleUploadOnAdd('logo')}
              onRemove={this.handleUploadOnRemove('logo')}
              placeholder={formatMessage(messages.uploadPlaceholder)}
              disallowDeletion={false}
            />
            <Error text={logoError} />
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
