import React, { useEffect } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ContentBuilderToggle from 'modules/commercial/content_builder/admin/components/contentBuilderToggle';
import useFeatureFlag from 'hooks/useFeatureFlag';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'projects/:projectId/description/content-builder',
        name: 'content_builder',
        container: () => import('./admin/containers/index'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.edit.description.contentBuilder': (
      props
    ) => {
      const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });

      useEffect(() => {
        if (!featureEnabled) return;
        props.onMount();
      }, [props.onMount, featureEnabled]);

      return (
        <>
          <ContentBuilderToggle {...props} />
        </>
      );
    },
  },
};

export default configuration;
