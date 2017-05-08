import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'semantic-ui-react';
// import { push } from 'react-router-redux';
//  handleClose = () => this.props.push('/ideas');

const WrapChild = ({ handleClose, children, open }) => (
  <Modal open={open} onClose={handleClose}>
    <Button circular icon={'remove'} style={{ float: 'right', margin: '5px' }} onClick={handleClose} />
    <Modal.Content>
      <Modal.Description>
        { children }
      </Modal.Description>
    </Modal.Content>
  </Modal>
);

WrapChild.propTypes = {
  handleClose: PropTypes.func.isRequired,
  children: PropTypes.element,
  open: PropTypes.bool.isRequired,
};

class OverlayChildren extends React.Component { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super();
    this.isMainView = props.isMainView;
    this.component = props.component;
    this.pageView = this.isMainView(props) ? this.mainView : this.childView;
  }

  mainView = () => {
    const inMainView = this.isMainView(this.props);
    const { handleClose } = this.props;

    return (
      <div>
        {React.createElement(this.component, this.props)}
        <WrapChild handleClose={handleClose} open={!inMainView}>
          {this.props.children}
        </WrapChild>
      </div>
    );
  }

  childView = () => {
    const inMainView = this.isMainView(this.props);

    if (inMainView) {
      this.pageView = this.mainView;
      return this.pageView();
    }
    return this.props.children;
  };

  render() {
    return (
      <div>
        { this.pageView() }
      </div>
    );
  }
}

OverlayChildren.propTypes = {
  children: PropTypes.element,
  isMainView: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  component: PropTypes.any,
};

export default OverlayChildren;
