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
import Upload, { ExtendedImageFile } from 'components/UI/Upload';
import ColorPickerInput from 'components/UI/ColorPickerInput';
import Select from 'components/UI/Select';
import FieldWrapper from 'components/admin/FieldWrapper';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// utils
import { getBase64 } from 'utils/imageTools';

// i18n
import { FormattedMessage, injectIntl, InjectedIntlProps, InjectedIntl } from 'react-intl';
import messages from '../messages';

// services
import {
  currentTenantStream,
  updateTenant,
  IUpdatedTenantProperties,
  ITenantData
} from 'services/tenant';

// typings
import { API } from 'typings.d';

interface Props {
  intl: InjectedIntl;
  lang: string;
  tFunc: Function;
}

interface State {
  attributesDiff: IUpdatedTenantProperties;
  tenant: ITenantData | null;
  loading: boolean;
  errors: { [fieldName: string]: API.Error[] };
  saved: boolean;
  localLogo: ImageFile[] | null;
  logoError: string | null;
}

class SettingsCustomizeTab extends React.Component<Props & InjectedIntlProps, State> {
  state: State;
  uploadPlaceholder: string;
  subscription: Rx.Subscription;

  constructor() {
    super();
    this.state = {
      attributesDiff: {},
      tenant: null,
      loading: false,
      errors: {},
      saved: false,
      localLogo: null,
      logoError: null
    };
  }

  componentWillMount() {
    this.uploadPlaceholder = this.props.intl.formatMessage(messages.uploadPlaceholder);
  }

  componentDidMount() {
    this.subscription = currentTenantStream().observable.subscribe((response) => {
      this.setState({ tenant: response.data });
    });
  }

  getSubmitState = (): 'disabled' | 'enabled' | 'error' | 'success' => {
    if (!_.isEmpty(this.state.errors)) {
      return 'error';
    }

    if (this.state.saved && _.isEmpty(this.state.attributesDiff)) {
      return 'success';
    }

    return _.isEmpty(this.state.attributesDiff) ? 'disabled' : 'enabled';
  }

  handleUploadOnAdd = (name: string) => async (newImage: ImageFile) => {
    const base64Image = await getBase64(newImage);

    this.setState((state: State) => ({
      attributesDiff: { ...state.attributesDiff, [name]: base64Image },
      localLogo: (name === 'logo' ? [newImage] : state.localLogo)
    }));
  }

  handleUploadOnRemove = (name: string) => (image: ImageFile) => {
    this.setState((state: State) => ({
      attributesDiff: { ...state.attributesDiff, [name]: null },
      localLogo: (name === 'logo' ? null : state.localLogo)
    }));
  }

  handleUploadOnRemoveApiImage = (name: string) => (image: API.ImageSizes) => {
    this.setState((state: State) => ({
      attributesDiff: { ...state.attributesDiff, [name]: null },
      localLogo: (name === 'logo' ? null : state.localLogo)
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
    const { tenant, attributesDiff } = this.state;

    // first reset any error messages
    this.setState({ logoError: null });

    if (attributesDiff.logo === null) {
      this.setState({ logoError: formatMessage(messages.noLogo) });
    } else if (tenant) {
      const { attributesDiff } = this.state;

      this.setState({ loading: true, saved: false });

      try {
        console.log('updateTenant with:');
        console.log(attributesDiff);
        await updateTenant(tenant.id, attributesDiff);
        this.setState({ loading: false, saved: true, localLogo: null, attributesDiff: {} });
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
    const { tenant, attributesDiff, localLogo, logoError } = this.state;

    if (tenant) {
      const tenantAttrs = _.merge(tenant.attributes, attributesDiff);
      const apiLogo = (!_.has(attributesDiff, 'logo') ? [tenant.attributes.logo] : undefined);

      console.log('tenant:');
      console.log(tenant);
      console.log('tenantAttrs:');
      console.log(tenantAttrs);

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
              items={localLogo}
              apiImages={apiLogo}
              onAdd={this.handleUploadOnAdd('logo')}
              onRemove={this.handleUploadOnRemove('logo')}
              onRemoveApiImage={this.handleUploadOnRemoveApiImage('logo')}
              placeholder={this.uploadPlaceholder}
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
