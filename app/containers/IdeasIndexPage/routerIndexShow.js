import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal, Button } from 'semantic-ui-react';
import { push } from 'react-router-redux';


import Index from './index';

class XIdeaModal extends React.Component {

  handleClose = () => this.props.push('/ideas');

  render() {
    return (
      <Modal open onClose={this.handleClose}>
      <Button circular icon='remove' style={{ float: 'right', margin: '5px' }} onClick={this.handleClose} />
        <Modal.Content>
          <Modal.Description>
            { this.props.children }
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
};


XIdeaModal.propTypes = {
  push: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ push }, dispatch);
const IdeaModal = connect(null, mapDispatchToProps)(XIdeaModal);

class RouterIndexShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super();
    this.pageView = props.params.slug ? this.showView : this.indexView;
  }

  componentDidMount() {
    this.previousSlut = this.currentSlug;
  }

  componentWillReceiveProps(next) {
    this.currentSlug = next.params.slug;
  }

  componentDidUpdate() {
    this.previousSlut = this.currentSlug;
  }

  indexView(slug) {
    return (
      <div>
        <Index />
        { slug && <IdeaModal> {this.props.children} </IdeaModal> }
      </div>
    );
  }


  showView() {
    return this.props.children;
  }

  render() {
    const { params } = this.props;
    return (
      <div>
        <Helmet
          title={'IdeasIndexPage'}
          meta={[
            { name: 'description', content: 'Description of IdeasIndexPage' },
          ]}
        />
        { this.pageView(params.slug) }
      </div>
    );
  }
}

RouterIndexShow.propTypes = {
  children: PropTypes.element,
};

export default RouterIndexShow;
