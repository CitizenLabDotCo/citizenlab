/*
 *
 * IdeasIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import { Sidebar as LayoutSidebar } from 'semantic-ui-react';

import WatchSagas from 'containers/WatchSagas';

import sagasWatchers from './sagas';
import { filterIdeas, loadIdeas, loadTopicsRequest, loadAreasRequest } from './actions';

// implemented but not used now.
// import Sidebar from './components/sidebar';
import Panel from './components/panel';


class View extends React.Component {
  constructor(props) {
    super();
    const { location } = props;
    this.search = location.search;
    this.state = { visible: false };
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

  shouldComponentUpdate(props, { visible }) {
    const current = this.state.visible;
    return current !== visible;
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

  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    // this component will controll the proper rerender of the view when the Topics and Areas list is toggled.
    // const { visible } = this.state;
    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <Panel />

        {/*
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

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
        */}
      </div>
    );
  }
}

View.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

View.propTypes = {
  loadTopicsRequest: PropTypes.func.isRequired,
  loadAreasRequest: PropTypes.func.isRequired,
  location: PropTypes.object,
  filterIdeas: PropTypes.func.isRequired,
  loadIdeas: PropTypes.func.isRequired,
};

const actions = { filterIdeas, loadIdeas, loadTopicsRequest, loadAreasRequest };

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);


export default connect(null, mapDispatchToProps)(View);
