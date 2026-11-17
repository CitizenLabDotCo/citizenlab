import React, { useEffect } from 'react';

import Cookies from 'js-cookie';

import { Spinner } from '@citizenlab/cl2-component-library';

import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

const ProjectPreviewToken = () => {
  const { slug, token } = useParams({ strict: false }) as {
    slug: string;
    token: string;
  };
  useEffect(() => {
    Cookies.set('preview_token', token);
    clHistory.push(`/projects/${slug}`);
  }, [token, slug]);
  return <Spinner />;
};

export default ProjectPreviewToken;
