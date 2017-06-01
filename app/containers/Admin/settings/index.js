import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Saga } from 'react-redux-saga';
import { bindActionCreators } from 'redux';
import { Form } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';
import { injectTFunc } from 'containers/T/utils';
import { ChromePicker } from 'react-color';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { makeSelectCurrentTenant } from './selectors';
import { saveSettings } from './actions';
import { watchSaveSettings } from './sagas';
import messages from './messages';


class SettingsPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super();

    const hexToRgb = (hex) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const newHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(newHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      } : null;
    };

    const { tenant, tFunc } = props;
    const organizationName = tFunc(tenant.getIn(['attributes', 'settings', 'core', 'organization_name']).toJS());
    const accentColorHex = tenant.getIn(['attributes', 'settings', 'core', 'style_accent_bg']);
    const accentColorRGB = hexToRgb(accentColorHex);
    const displayColorPicker = false;

    this.state = {
      organizationName,
      accentColorHex,
      accentColorRGB,
      displayColorPicker,
    };
  }

  handleChangeComplete = (color) => {
    this.setState({ accentColorHex: color.hex });
  };

  openColorPicker = (e) => {
    e.preventDefault();
    this.setState({ displayColorPicker: true });
  };

  closeColorPicker = (e) => {
    e.preventDefault();
    this.setState({ displayColorPicker: false });
  };

  colorPicked = (color) => {
    this.setState({
      accentColorHex: color.hex,
      accentColorRGB: color.rgb,
    });
  };

  organizationNameChange = (e) => {
    this.setState({ organizationName: e.target.value });
  }

  hexChange = (e) => {
    this.setState({ accentColorHex: e.target.value });
  }

  save = (e) => {
    e.preventDefault();
    this.props.saveSettings(this.props.tenant.get('id'), this.props.locale, this.state.organizationName, this.state.accentColorHex);
  }

  render() {
    const color = {
      width: '37px',
      height: '37px',
      borderRadius: '4px',
      background: `rgba(${this.state.accentColorRGB.r}, ${this.state.accentColorRGB.g}, ${this.state.accentColorRGB.b}, 1)`,
      display: 'inline-block',
      float: 'left',
    };

    const popover = {
      position: 'absolute',
      zIndex: '2',
    };

    const cover = {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    };

    const colorPicker = (this.state.displayColorPicker ? (
      <div style={popover}>
        <div style={cover} onClick={this.closeColorPicker} />
        <ChromePicker disableAlpha color={this.state.accentColorHex} onChange={this.colorPicked} onChangeComplete={this.colorPicked} />
      </div>
    ) : null);

    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <h1>Settings</h1>
        <Saga saga={watchSaveSettings} />

        <Form>
          <Form.Field>
            <label htmlFor="organization_name">First name</label>
            <input
              id="organization_name"
              placeholder="Organization name"
              value={this.state.organizationName}
              onChange={this.organizationNameChange}
            />
          </Form.Field>

          <Form.Field>
            <label htmlFor="style_accent_color">Accent color</label>
            <div style={color} onClick={this.openColorPicker} />
            <input
              id="style_accent_color"
              placeholder="Accent color"
              value={this.state.accentColorHex}
              onFocus={this.openColorPicker}
              onChange={this.hexChange}
            />
            {colorPicker}
          </Form.Field>

          <Form.Button onClick={this.save}>Submit</Form.Button>
        </Form>

      </div>
    );
  }
}

SettingsPage.propTypes = {
  tenant: ImmutablePropTypes.map.isRequired,
  tFunc: PropTypes.func,
  locale: PropTypes.any,
  saveSettings: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  tenant: makeSelectCurrentTenant(),
  locale: makeSelectLocale(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ saveSettings }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(injectTFunc(SettingsPage));
