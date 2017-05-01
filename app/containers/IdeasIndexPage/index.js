/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { bindActionCreators } from 'redux';
import { Icon, Sidebar, Segment } from 'semantic-ui-react';

import messages from './messages';
import { initIdeasData, loadNextPage } from './actions';
import { ideasSaga, topicsSaga, areasSaga } from './sagas';

import SidebarMenuContainer from './components/sidebarMenu';
import Pannel from './components/panel';


class PannelContainer extends React.Component {
  constructor() {
    super();
    this.state = { visible: false };
  }

  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    // this component will controll the proper rerender of the view when the Topics and Areas list is toggled.
    const { visible } = this.state;
    return (
      <div style={{ display: 'table', lineHeight: 0, fontSize: '0' }}>
        <div
          style={{
            display: 'table-cell',
            width: '50px',
            height: '100%',
            overflow: 'visible',
            lineHeight: 0,
            fontSize: '0',
            marginTop: '5px',
            backgroundColor: '#1b1c1d',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Icon
              onClick={this.toggleVisibility}
              name={'bars'}
              style={{
                verticalAlign: 'top',
                fontSize: '26px',
                lineHeight: '46px',
                color: 'white',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>


        <Sidebar.Pushable as={Segment} style={{ margin: '0', padding: '0', border: 'none', borderRadius: 0 }}>
          <SidebarMenuContainer visible={visible} toggleVisibility={this.toggleVisibility} />
          <Sidebar.Pusher>
            <Panel />
          </Sidebar.Pusher>
        </Sidebar.Pushable>


      </div>
    );
  }
}

export class IdeasIndexPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.runningSagas = [];
  }

  componentWillMount() {
    if (this.context.sagas) {
      [ideasSaga, topicsSaga, areasSaga].map((saga) => {
        const runSaga = this.context.sagas.run(saga, this.props);
        return this.runningSagas.push(runSaga);
      });
      this.props.initIdeasData();
    }
  }

  componentWillUnmount() {
    this.runningSagas.map((saga) => saga.cancel());
    delete this.runningSagas;
  }

  render() {
    return (
      <div>
        <Helmet
          title={'IdeasIndexPage'}
          meta={[
            { name: 'description', content: 'Description of IdeasIndexPage' },
          ]}
        />

        <h1>
          <FormattedMessage {...messages.header} />
        </h1>
        <PannelContainer />
        {this.props.children || ''}
      </div>
    );
  }
}

IdeasIndexPage.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

IdeasIndexPage.propTypes = {
  initIdeasData: PropTypes.func.isRequired,
  children: PropTypes.element,
};


const mapDispatchToProps = (dispatch) => bindActionCreators({ initIdeasData, loadNextPage }, dispatch);


export default connect(null, mapDispatchToProps)(IdeasIndexPage);
