import React from 'react';
import RequestToCosponsor from './RequestToCosponsor';
import Cosponsors from './Cosponsors';

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
