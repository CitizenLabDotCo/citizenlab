import React from 'react';
import PropTypes from 'prop-types';
import { fromJS } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Checkbox } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';
import { injectTFunc } from 'containers/T/utils';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import Upload from 'components/UI/Upload';
import ColorPickerInput from 'components/UI/ColorPickerInput';
import Select from 'components/UI/Select';
// import { makeSelectCurrentTenant } from '../selectors';
import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';
import { saveSettings } from '../actions';
import messages from '../messages';


class SettingsCustomizeTab extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = {
      changedAttributes: fromJS({}),
      temp_logo: [],
      temp_header_bg: [],
    };
  }

  componentWillMount() {
    this.uploadPlaceholder = this.props.intl.formatMessage(messages.uploadPlaceholder);
  }

  changeAttribute(path, value) {
    this.setState({
      changedAttributes: this.state.changedAttributes.setIn(path, value),
    });
  }

  changeImage(name, value) {
    const reader = new FileReader();
    reader.readAsDataURL(value);
    reader.onload = () => {
      this.setState({
        changedAttributes: this.state.changedAttributes.set(name, reader.result),
        [`temp_${name}`]: [value],
      });
    };
  }

  removeImage(name) {
    this.setState({
      changedAttributes: this.state.changedAttributes.set(name, null),
      [`temp_${name}`]: [],
    });
  }

  save = (e) => {
    e.preventDefault();
    this.props.saveSettings(this.props.tenant.get('id'), this.state.changedAttributes.toJS());
  }

  menuStyleOptions= () => ([
    {
      value: 'light',
      label: this.props.intl.formatMessage(messages.menuStyleLight),
    },
    {
      value: 'dark',
      label: this.props.intl.formatMessage(messages.menuStyleDark),
    },
  ]);

  render() {
    const updatedTenant = this.props.tenant.update('attributes', (t) => {
      return t.mergeDeep(this.state.changedAttributes);
    });
    const settings = updatedTenant.getIn(['attributes', 'settings']);
    return (
      <div>


        <h1><FormattedMessage {...messages.titleBranding} /></h1>
        <p><FormattedMessage {...messages.subTitleBranding} /></p>

        <div>
          <Label><FormattedMessage {...messages.menuStyle} /></Label>
          <Select
            value={settings.getIn(['core', 'menu_style'])}
            options={this.menuStyleOptions()}
            onChange={(option) => this.changeAttribute(['settings', 'core', 'menu_style'], option.value)}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.mainColor} /></Label>
          <ColorPickerInput
            value={settings.getIn(['core', 'color_main'])}
            onChange={(value) => this.changeAttribute(['settings', 'core', 'color_main'], value)}
          />
        </div>


        <div>
          <Label><FormattedMessage {...messages.logo} /></Label>
          <Upload
            accept="image/*"
            maxItems={1}
            items={this.state.temp_logo}
            onAdd={(value) => this.changeImage('logo', value)}
            onRemove={() => this.removeImage('logo')}
            placeholder={this.uploadPlaceholder}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.headerBg} /></Label>
          <Upload
            accept="image/*"
            maxItems={1}
            items={this.state.temp_header_bg}
            onAdd={(value) => this.changeImage('header_bg', value)}
            onRemove={() => this.removeImage('header_bg')}
            placeholder={this.uploadPlaceholder}
          />
        </div>

        <h1><FormattedMessage {...messages.titleSignupFields} /></h1>
        <p><FormattedMessage {...messages.subTitleSignupFields} /></p>


        <div>
          <Label><FormattedMessage {...messages.gender} /></Label>
          <Checkbox
            slider
            checked={settings.getIn(['demographic_fields', 'gender'])}
            onChange={(event, value) => this.changeAttribute(['settings', 'demographic_fields', 'gender'], value.checked)}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.domicile} /></Label>
          <Checkbox
            slider
            checked={settings.getIn(['demographic_fields', 'domicile'])}
            onChange={(event, value) => this.changeAttribute(['settings', 'demographic_fields', 'domicile'], value.checked)}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.birthyear} /></Label>
          <Checkbox
            slider
            checked={settings.getIn(['demographic_fields', 'birthyear'])}
            onChange={(event, value) => this.changeAttribute(['settings', 'demographic_fields', 'birthyear'], value.checked)}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.education} /></Label>
          <Checkbox
            slider
            checked={settings.getIn(['demographic_fields', 'education'])}
            onChange={(event, value) => this.changeAttribute(['settings', 'demographic_fields', 'education'], value.checked)}
          />
        </div>

        <Button onClick={this.save}>
          <FormattedMessage {...messages.save} />
        </Button>

      </div>
    );
  }
}

SettingsCustomizeTab.propTypes = {
  tenant: ImmutablePropTypes.map.isRequired,
  saveSettings: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  tenant: makeSelectCurrentTenantImm(),
});

const mapDispatchToProps = {
  saveSettings,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(injectTFunc(SettingsCustomizeTab)));
