import React from 'react';
import InfoSidebarSingle from './InfoSidebarSingle';
import InfoSidebarMulti from './InfoSidebarMulti';

export default (props: { ideaIds: string[] }) => (
  props.ideaIds.length > 1 ? <InfoSidebarMulti ideaIds={props.ideaIds} /> : <InfoSidebarSingle ideaId={props.ideaIds[0]} />
);
