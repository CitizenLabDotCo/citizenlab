import React, { useEffect, useState } from 'react';

import { capitalize } from 'lodash';
import { darken } from 'polished';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import Link from 'utils/cl-router/Link';
import { isAdmin } from 'utils/permissions/roles';

import { truncateText } from './utils';

// This component was added as part of the spotlight rollout. It used to be
// rendered inline in the projects table, but now it lives in its own file.
const BadgeWrapper = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background: ${({ $active, theme }) =>
    $active ? darken(0.1, theme.colors.tenantPrimary) : '#e0e0e0'};
`;

type SpotlightData = {
  total_views: number;
  status: string;
};

interface Props {
  projectId?: string;
  projectTitle?: string;
  [key: string]: any;
}

const NewSpotlightBadgeV2 = ({ projectId, projectTitle, ...rest }: Props) => {
  const { data: authUser } = useAuthUser();
  const [title, setTitle] = useState(projectTitle ?? '');
  const [data, setData] = useState<SpotlightData | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    setTitle(projectTitle ?? '');
  }, [projectTitle]);

  useEffect(() => {
    fetch(`/web_api/v1/projects/${projectId}/spotlight`)
      .then((res) => res.json())
      .then((json) => setData(json as SpotlightData));
  }, [projectId]);

  useEffect(() => {
    const onScroll = () => setHasScrolled(true);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // const oldBadge = (
  //   <div className="spotlight-badge">
  //     {title} ({data?.total_views})
  //   </div>
  // );

  const renderStats = () => {
    if (!data) return null;
    return (
      <span data-cy="e2e-spotlight-stats">
        {capitalize(data.status)} · {data.total_views} views
      </span>
    );
  };

  if (!isAdmin(authUser)) return null;

  return (
    <BadgeWrapper $active={hasScrolled} {...rest}>
      <StatusDot status={(data?.status ?? '') as 'active' | 'archived'} />
      <Link to={('/admin/projects/' + projectId + '/spotlight') as any}>
        {truncateText(title, 30)}
      </Link>
      {renderStats()}
    </BadgeWrapper>
  );
};

const StatusDot = ({ status }: { status: 'active' | 'archived' }) => {
  const color = status === 'active' ? '#2ecc71' : '#95a5a6';
  return (
    <span
      style={{ background: color, width: 8, height: 8, borderRadius: '50%' }}
    />
  );
};

export default NewSpotlightBadgeV2;
