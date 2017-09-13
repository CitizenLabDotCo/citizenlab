// Libraries
import * as React from 'react';
import { fromJS } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import * as Rx from 'rxjs/Rx';
import { API } from 'typings.d';
import * as _ from 'lodash';

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
import { FormattedMessage, injectIntl, intlShape, InjectedIntl } from 'react-intl';
import messages from '../messages';

// Store
import { createStructuredSelector } from 'reselect';
import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';
import { saveSettings } from '../actions';

// Services
import {
  currentTenantStream,
  TenantUpdatedAttributes,
  ITenantData
} from 'services/tenant';

// Typing
interface Props {
  intl: InjectedIntl;
  lang: string;
  tFunc: Function;
}

interface State {
  attributesDiff: TenantUpdatedAttributes;
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
      console.log(response);
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

  changeImage(name, value) {
    const reader = new FileReader();
    reader.readAsDataURL(value);
    reader.onload = () => {
      this.setState({
        // changedAttributes: this.state.changedAttributes.set(name, reader.result),
        // [`temp_${name}`]: [value],
      });
    };
  }

  removeImage(name) {
    this.setState({
      // changedAttributes: this.state.changedAttributes.set(name, null),
      // [`temp_${name}`]: [],
    });
  }

  save = (e) => {
    e.preventDefault();
    // this.props.saveSettings(this.props.tenant.get('id'), this.state.changedAttributes.toJS());
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
    ? { ...this.state.tenant.attributes, ...this.state.attributesDiff }
    : { ...this.state.attributesDiff };

    return (
      <div>


        <h1><FormattedMessage {...messages.titleBranding} /></h1>
        <p><FormattedMessage {...messages.subTitleBranding} /></p>

        <div>
          <Label><FormattedMessage {...messages.menuStyle} /></Label>
          <Select
            value={_.get(tenantAttrs, 'settings.core.menu_style', '')}
            options={this.menuStyleOptions()}
            onChange={console.log}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.mainColor} /></Label>
          <ColorPickerInput
            type="text"
            value={_.get(tenantAttrs, 'settings.core.color_main')}
            onChange={console.log}
          />
        </div>


        <div>
          <Label><FormattedMessage {...messages.logo} /></Label>
          <Upload
            accept="image/*"
            maxItems={1}
            items={[]}
            apiImages={[_.get(tenantAttrs, 'logo')]}
            onAdd={console.log}
            onRemove={console.log}
            placeholder={this.uploadPlaceholder}
            intl={this.props.intl}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.headerBg} /></Label>
          <Upload
            accept="image/*"
            maxItems={1}
            items={[]}
            apiImages={[_.get(tenantAttrs, 'header_bg')]}
            onAdd={console.log}
            onRemove={console.log}
            placeholder={this.uploadPlaceholder}
            intl={this.props.intl}
          />
        </div>

        <h1><FormattedMessage {...messages.titleSignupFields} /></h1>
        <p><FormattedMessage {...messages.subTitleSignupFields} /></p>


        <div>
          <Label><FormattedMessage {...messages.gender} /></Label>
          <Checkbox
            slider={true}
            checked={_.get(tenantAttrs, 'settings.demographic_fields.gender')}
            onChange={console.log}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.domicile} /></Label>
          <Checkbox
            slider={true}
            checked={_.get(tenantAttrs, 'settings.demographic_fields.domicile')}
            onChange={console.log}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.birthyear} /></Label>
          <Checkbox
            slider={true}
            checked={_.get(tenantAttrs, 'settings.demographic_fields.birthyear')}
            onChange={console.log}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.education} /></Label>
          <Checkbox
            slider={true}
            checked={_.get(tenantAttrs, 'settings.demographic_fields.education')}
            onChange={console.log}
          />
        </div>

        <Button onClick={this.save}>
          <FormattedMessage {...messages.save} />
        </Button>

      </div>
    );
  }
}

export default injectIntl(injectTFunc(SettingsCustomizeTab));
