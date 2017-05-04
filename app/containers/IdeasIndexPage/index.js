/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { bindActionCreators } from 'redux';
import { Icon, Sidebar as LayoutSidebar, Segment } from 'semantic-ui-react';

import { withRouter } from 'react-router';

import messages from './messages';
import { loadIdeas, loadTopicsRequest, loadAreasRequest, filterIdeas } from './actions';
import { ideasSaga, topicsSaga, areasSaga } from './sagas';

import Sidebar from './components/sidebar';
import Panel from './components/panel';


class PagePresentation extends React.Component {
  constructor() {
    super();
    this.state = { visible: false };
  }

  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    // this component will controll the proper rerender of the view when the Topics and Areas list is toggled.
    const { visible } = this.state;
    return (
      <div style={{ display: 'table', lineHeight: 0, fontSize: '0', width: '100%' }}>
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


        <LayoutSidebar.Pushable as={Segment} style={{ margin: '0', padding: '0', border: 'none', borderRadius: 0 }}>
          <Sidebar visible={visible} toggleVisibility={this.toggleVisibility} />
          <LayoutSidebar.Pusher>
            <Panel />
          </LayoutSidebar.Pusher>
        </LayoutSidebar.Pushable>


      </div>
    );
  }
}

// Ideas show does not use helmet at this view is controlled by RouterIndexShow
export class Index extends React.Component {
  constructor() {
    super();
    this.runningSagas = [];
  }

  componentWillMount() {
    if (this.context.sagas) {
      const sagas = [ideasSaga, topicsSaga, areasSaga];
      sagas.map((saga) => {
        const runSaga = this.context.sagas.run(saga, this.props);
        return this.runningSagas.push(runSaga);
      });
      this.props.loadTopicsRequest();
      this.props.loadAreasRequest();
      this.getideas();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.getideas(nextProps);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    this.runningSagas.map((saga) => saga.cancel());
    delete this.runningSagas;
  }

  getideas = (props) => {
    const data = props || this.props;
    const search = data.location.search;

    if (search) {
      this.props.filterIdeas(search);
    } else {
      this.props.loadIdeas(true);
    }
  }

  render() {
    return (
      <div>
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>
        <PagePresentation />
      </div>
    );
  }
}

Index.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

Index.propTypes = {
  loadTopicsRequest: PropTypes.func.isRequired,
  loadAreasRequest: PropTypes.func.isRequired,
  loadIdeas: PropTypes.func.isRequired,
  filterIdeas: PropTypes.func.isRequired,
  // location: PropTypes.object.isRequired,
  // 'location.search': PropTypes.string,
};


const mapDispatchToProps = (dispatch) => bindActionCreators({ loadIdeas, loadTopicsRequest, loadAreasRequest, filterIdeas }, dispatch);


export default connect(null, mapDispatchToProps)(withRouter(Index));
