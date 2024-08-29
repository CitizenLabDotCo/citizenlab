import React from 'react';

import Cosponsors from './Cosponsors';
import RequestToCosponsor from './RequestToCosponsor';

interface Props {
  initiativeId: string;
}

const CosponsorsSection = ({ initiativeId }: Props) => {
  return (
    <>
      <RequestToCosponsor initiativeId={initiativeId} />
      <Cosponsors initiativeId={initiativeId} />
    </>
  );
};

export default CosponsorsSection;
