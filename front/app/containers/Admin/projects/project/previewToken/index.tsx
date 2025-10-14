import React, { useEffect } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import { set } from 'js-cookie';
import { useParams } from 'utils/router';

import clHistory from 'utils/cl-router/history';

const ProjectPreviewToken = () => {
  const { slug, token } = useParams({ strict: false }) as {
    slug: string;
    token: string;
  };
  useEffect(() => {
    set('preview_token', token);
    clHistory.push(`/projects/${slug}`);
  }, [token, slug]);
  return <Spinner />;
};

export default ProjectPreviewToken;
