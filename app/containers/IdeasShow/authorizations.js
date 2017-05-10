import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';


const authorizations = {
  comments: {
      create: {
        required: 'ideaId',
        scope: 'resurces','ideas'
        check: (user, subject) => {
          // user && (record.author_id == user.id || user.admin?)
        }
    },
    delete: (user, subject) => {
      // user && (record.author_id == user.id || user.admin?)
    }
  }
}


class Authorize extends React.Component {
  constructor(props) {
    const rules = args.reduce((a, b) => authorizations[b], authorizations)
  }
}

const authorize = (...args) => {


const authorizer = () => () => {

}

const mapStateToProps = () => createStructuredSelector({
  user: (state, { resourceId }) => selectResourcesDomain(resource, authorId)(state),
});

const mergeProps = ({ user }, dispatchProps, ownProps) => {
  const { children } = ownProps;
  if (!user) return {}
  const attributes = user.get('attributes');
  const firstName = attributes.get('first_name');
  const lastName = attributes.get('last_name');
  const avatar = attributes.getIn(['avatar', 'small'])

  return {
    avatar,
    firstName,
    lastName,
    lastName,
    children,
  };

};


export default preprocess(mapStateToProps, null, mergeProps)(Author)
