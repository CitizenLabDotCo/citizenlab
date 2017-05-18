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
    this.pageView = this.isMainView(props) ? this.mainView : this.childView;
  }

  getChildContext() {
    const { toChildView, handleClose } = this.props;
    return { toChildView, handleClose };
  }

  mainView = () => {
    const inMainView = this.isMainView(this.props);
    const { handleClose, component, children } = this.props;
    return (
      <div>
        {React.createElement(component, this.props)}
        <WrapChild handleClose={handleClose} open={!inMainView}>
          {children && React.cloneElement(children, this.props)}
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

OverlayChildren.childContextTypes = {
  toChildView: PropTypes.func,
  handleClose: PropTypes.func,
};

OverlayChildren.propTypes = {
  children: PropTypes.element,
  isMainView: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  component: PropTypes.any,
  toChildView: PropTypes.func,
};

export default OverlayChildren;
