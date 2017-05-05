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
import { Saga } from 'react-redux-saga'
import { Icon, Sidebar as LayoutSidebar, Segment } from 'semantic-ui-react';

import { push } from 'react-router-redux';

import OverlayChildren from 'containers/OverlayChildren'; 

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

  shouldComponentUpdate(props, { visible }) {
    const current = this.state.visible;
    return current !== visible;
  }

  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    console.log('rerendering')
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
class IdeasIndex extends React.Component {
  constructor(props) {
    super();
    this.runningSagas = [];
    const { location } = props;
    this.search = location.search;
  }

  componentDidMount() {
    this.props.loadTopicsRequest();
    this.props.loadAreasRequest();
    this.getideas();
  }

  /* Component should update if new query params are provided */
  componentWillReceiveProps(nextProps) {
    const newSearch = nextProps.location.search;
    const isNewSearch = newSearch !== this.search;
    this.search = newSearch;
    if (isNewSearch) this.getideas(nextProps);
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

  isMainView = ({ params }) => !params.slug;

  backToMainView = () => this.props.push('/ideas');

  render() {
    const { children } = this.props;
    return (
      <div>
        <Saga saga={ideasSaga} />
        <Saga saga={topicsSaga} />
        <Saga saga={areasSaga} />

        <h1>
          <FormattedMessage {...messages.header} />
        </h1>
        <OverlayChildren
          component={PagePresentation}
          isMainView={this.isMainView}
          handleClose={this.backToMainView}
          {...this.props}
        >
          {children}
        </OverlayChildren>
      </div>
    );
  }
}

IdeasIndex.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

IdeasIndex.propTypes = {
  loadTopicsRequest: PropTypes.func.isRequired,
  loadAreasRequest: PropTypes.func.isRequired,
  loadIdeas: PropTypes.func.isRequired,
  filterIdeas: PropTypes.func.isRequired,
  children: PropTypes.element,
  location: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired,
  // 'location.search': PropTypes.string,
};

const actions = { loadIdeas, loadTopicsRequest, loadAreasRequest, filterIdeas, push }

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);


export default connect(null, mapDispatchToProps)(IdeasIndex);
