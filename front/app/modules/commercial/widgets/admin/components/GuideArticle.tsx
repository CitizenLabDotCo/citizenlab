import React from 'react';
import AdminGuideArticle from 'containers/Admin/guide/AdminGuideArticle';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/Admin/guide/tracks';

// i18n
import messages from '../messages';

const GuideArticle = () => {
  const handleClickInteralTrack = () => {
    trackEventByName(tracks.internalLink.name, {
      extra: { section: 'setup', article: 'widgets' },
    });
  };
  return (
    <AdminGuideArticle
      key="setupArticleWidget"
      trackLink={handleClickInteralTrack}
      linkMessage={messages.setupArticle3Link}
      titleMessage={messages.setupArticle3Title}
      descriptionMessage={messages.setupArticle3Description}
    />
  );
};

export default GuideArticle;
