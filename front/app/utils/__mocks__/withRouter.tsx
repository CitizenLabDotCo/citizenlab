import React from 'react';

export const withRouter = (Component) => {
  return (props) => {
    return <Component {...props} location={{ pathname: 'en' }} />;
  };
};
