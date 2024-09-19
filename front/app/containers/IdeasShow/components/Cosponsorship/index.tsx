import React from 'react';

import useCosponsorships from 'api/cosponsorship/useCosponsorships';

import useFeatureFlag from 'hooks/useFeatureFlag';

const Cosponsorship = ({ ideaId }: { ideaId: string }) => {
  const isCosponsorshipEnabled = useFeatureFlag({
    name: 'input_cosponsorship',
  });

  const { data: cosponsors } = useCosponsorships({
    ideaId,
  });

  if (!isCosponsorshipEnabled) {
    return null;
  }

  console.log(cosponsors);
  return <div>Cosponsorship</div>;
};

export default Cosponsorship;
