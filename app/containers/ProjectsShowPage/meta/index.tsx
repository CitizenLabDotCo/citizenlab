import * as React from 'react';
import * as Immutable from 'immutable';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { injectTFunc } from 'components/T/utils';
import { injectIntl } from 'utils/cl-intl';
import { selectProject, selectProjectImages } from './selectors';
import { stripHtml } from 'utils/textUtils';

type Props = {
  project: Immutable.Map<string, any>,
  images: Immutable.List<any>,
  tFunc: ({}) => string,
  location: any,
};

const Meta: React.SFC<Props> = ({ location, project, images, tFunc }) => {
  if (project && !project.isEmpty()) {
    const titleMultiloc = project.getIn(['attributes', 'title_multiloc']);
    const descriptionMultiloc = project.getIn(['attributes', 'description_multiloc']);
    const image = !images.isEmpty() && images.first().getIn(['attributes', 'versions', 'large']);
    const url = location.href;

    return (
      <Helmet>
        <title>{tFunc(titleMultiloc)}</title>
        <meta property="og:title" content={tFunc(titleMultiloc)} />
        <meta property="og:description" content={stripHtml(tFunc(descriptionMultiloc))} />
        {image && <meta property="og:image" content={image} />}
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
    );
  }

  return null;
};

const mapStateToProps = createStructuredSelector({
  project: selectProject,
  images: selectProjectImages,
});

export default injectTFunc(connect(mapStateToProps)(Meta));
