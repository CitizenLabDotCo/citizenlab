import React from 'react';

import { Icon, colors } from '@citizenlab/cl2-component-library';

import { SpaceListData } from 'api/spaces/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import SpaceActions from '../Actions/SpaceActions';
import { ArrangePlace } from '../Arrange/arrangeTargets';
import messages from '../messages';

import ContainerTile from './ContainerTile';

interface Props {
  space: SpaceListData;
  // Where it can be arranged, when it can.
  place?: ArrangePlace;
}

// Spaces have no image, so their tile always shows the spaces icon.
const SpaceTile = ({ space, place }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { title_multiloc, folders_count, projects_count } = space.attributes;

  const meta = [
    folders_count > 0 &&
      formatMessage(messages.foldersCount, { count: folders_count }),
    formatMessage(messages.projectsCount, { count: projects_count }),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ContainerTile
      level={{ kind: 'space', id: space.id }}
      title={localize(title_multiloc)}
      meta={meta}
      actions={<SpaceActions spaceId={space.id} place={place} />}
      media={
        <Icon
          name="spaces"
          width="16px"
          height="16px"
          fill={colors.coolGrey600}
        />
      }
    />
  );
};

export default SpaceTile;
