// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { API } from 'typings.d';
import * as _ from 'lodash';
import * as Dropzone from 'react-dropzone';

// Components
import { connect } from 'react-redux';
import { Checkbox } from 'semantic-ui-react';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import Upload from 'components/UI/Upload';
import ColorPickerInput from 'components/UI/ColorPickerInput';
import Select from 'components/UI/Select';
import FieldWrapper from 'components/admin/FieldWrapper';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// i18n
import { injectTFunc } from 'containers/T/utils';
import { FormattedMessage, injectIntl, InjectedIntl } from 'react-intl';
import messages from '../messages';

// Services
import {
  currentTenantStream,
  updateTenant,
  IUpdatedTenantProperties,
  ITenantData
} from 'services/tenant';

// Typing
interface Props {
  intl: InjectedIntl;
  lang: string;
  tFunc: Function;
}

interface State {
  attributesDiff: IUpdatedTenantProperties;
  tenant: ITenantData | null;
  loading: boolean;
  errors: {
    [fieldName: string]: API.Error[]
  };
  saved: boolean;
}

class SettingsCustomizeTab extends React.Component<Props, State> {
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

  createImageUploadHandler = (name: string) => {
    return (file: Dropzone.ImageFile): void => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const newDiff = _.merge({}, this.state.attributesDiff, { [name]:  reader.result } as IUpdatedTenantProperties);
        this.setState({ attributesDiff: newDiff });
      };
    };
  }

  createImageRemovalHandler = (name: string) => {
    return (): void => {
      const newDiff = _.merge({}, this.state.attributesDiff, { [name]: null } as IUpdatedTenantProperties);
      this.setState({ attributesDiff: newDiff });
    };
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

  save = (e): void => {
    e.preventDefault();

    const { tenant, attributesDiff } = this.state;

    if (!tenant) {
      return;
    }

    this.setState({ loading: true, saved: false });

    updateTenant(tenant.id, attributesDiff)
    .then(() => {
      this.setState({ saved: true, attributesDiff: {}, loading: false });
    })
    .catch((e) => {
      this.setState({ errors: e.json.errors, loading: false });
    });
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
    const tenantAttrs = this.state.tenant
    ? _.merge({}, this.state.tenant.attributes, this.state.attributesDiff)
    : _.merge({}, this.state.attributesDiff);

    return (
      <form onSubmit={this.save}>


        <h1><FormattedMessage {...messages.titleBranding} /></h1>
        <p><FormattedMessage {...messages.subTitleBranding} /></p>

        <FieldWrapper>
          <Label><FormattedMessage {...messages.menuStyle} /></Label>
          <Select
            value={_.get(tenantAttrs, 'settings.core.menu_style', '')}
            options={this.menuStyleOptions()}
            onChange={this.createToggleChangeHandler('settings.core.menu_style')}
          />
        </FieldWrapper>

        <FieldWrapper>
          <Label><FormattedMessage {...messages.mainColor} /></Label>
          <ColorPickerInput
            type="text"
            value={_.get(tenantAttrs, 'settings.core.color_main')}
            onChange={this.createToggleChangeHandler('settings.core.color_main')}
          />
        </FieldWrapper>


        {['logo', 'header_bg'].map((imageName) => {
          const uploadedImages = this.state.attributesDiff[imageName] ? [this.state.attributesDiff[imageName]] : [];
          const apiImages = (this.state.attributesDiff[imageName] === undefined && this.state.tenant && this.state.tenant.attributes[imageName].medium !== null)
            ? [this.state.tenant.attributes[imageName]]
            : [];

          return (
            <FieldWrapper key={imageName}>
              <Label><FormattedMessage {...messages[imageName]} /></Label>
              <Upload
                accept="image/*"
                maxItems={1}
                items={uploadedImages}
                apiImages={apiImages}
                onAdd={this.createImageUploadHandler(imageName)}
                onRemove={this.createImageRemovalHandler(imageName)}
                onRemoveApiImage={this.createImageRemovalHandler(imageName)}
                placeholder={this.uploadPlaceholder}
                intl={this.props.intl}
                disallowDeletion={true}
              />
            </FieldWrapper>
          );
        })}

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
}

export default injectIntl(injectTFunc(SettingsCustomizeTab));
