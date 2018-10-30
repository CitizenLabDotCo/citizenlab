// ./__mocks__/react-intl.js
import React from 'react';
const Intl = jest.genMockFromModule('react-intl');
console.log('hiiiiiiiiiiiiiiiiiiiii');
// Here goes intl context injected into component, feel free to extend
const intl = {
  formatMessage: ({ defaultMessage }) => defaultMessage
};

Intl.injectIntl = (Node) => {
  const renderWrapped = props => <Node {...props} intl={intl} />;
  renderWrapped.displayName = Node.displayName
    || Node.name
    || 'Component';
  return renderWrapped;
};

export default Intl;
