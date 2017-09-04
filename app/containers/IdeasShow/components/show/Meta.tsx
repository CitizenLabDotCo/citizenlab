import * as React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { injectTFunc } from 'utils/containers/t/utils';
import Helmet from 'react-helmet';
import { IIdeaData } from 'services/ideas';
import { selectIdeaImages, selectIdea } from '../../selectors';
import * as Immutable from 'immutable';
import { stripHtml } from 'utils/textUtils';


type Props = {
  idea: Immutable.Map<string, any>,
  images: Immutable.List<any>,
  tFunc: ({}) => string,
  location: any,
};

const Meta: React.SFC<Props> = ({ location, idea, images, tFunc }) => {

  if (!idea || !images) return null;

  const ideaJs: IIdeaData = idea.toJS();

  const titleMultiloc = ideaJs.attributes.title_multiloc;
  const descriptionMultiloc = ideaJs.attributes.body_multiloc;
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
};

const mapStateToProps = createStructuredSelector({
  idea: selectIdea,
  images: selectIdeaImages,
});

export default injectTFunc(connect(mapStateToProps)(Meta));
