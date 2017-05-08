import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';

import T from 'containers/T';
import ImageCarousel from 'components/ImageCarousel';





        <h2>
          <T value={attributes.title_multiloc} />
        </h2>
        <p><strong>By: {authorId} </strong></p>
        <IdeaContent>
          <T value={attributes.body_multiloc} />
        </IdeaContent>

function IdeaContent(props) {
  const { className, children } = props;

  return (
    <div className={className}>
      <span>{ children } </span>
      <hr />
    </div>
  );
}

IdeaContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  idea: (state, { id }) => selectResourcesDomain(type, id)(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(Filters);