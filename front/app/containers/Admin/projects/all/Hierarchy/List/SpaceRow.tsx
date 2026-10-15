import React from 'react';

import { Icon, Td, colors } from '@citizenlab/cl2-component-library';

import { SpaceListData } from 'api/spaces/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import ManagerBubbles from '../../_shared/ManagerBubbles';
import SpaceActions from '../Actions/SpaceActions';
import messages from '../messages';

import ActionsCell from './ActionsCell';
import { ColumnKey } from './columns';
import ItemRow from './ItemRow';
import TitleCell from './TitleCell';
import { Managers } from './useManagers';

interface Props {
  space: SpaceListData;
  columns: ColumnKey[];
  managers: Managers;
}

// A space uses the project columns for its name, what it holds and its
// managers; the others stay empty.
const SpaceRow = ({ space, columns, managers }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { title_multiloc, folders_count, projects_count } = space.attributes;

  const note = [
    folders_count > 0 &&
      formatMessage(messages.foldersCount, { count: folders_count }),
    formatMessage(messages.projectsCount, { count: projects_count }),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ItemRow>
      {columns.map((column) =>
        column === 'project' ? (
          <TitleCell
            key={column}
            lead={
              <Icon
                name="spaces"
                width="16px"
                height="16px"
                fill={colors.coolGrey600}
              />
            }
            title={localize(title_multiloc)}
            target={{ level: { kind: 'space', id: space.id } }}
            note={note}
          />
        ) : column === 'managers' ? (
          <Td key={column}>
            <ManagerBubbles managers={managers} />
          </Td>
        ) : (
          <Td key={column} />
        )
      )}
      <ActionsCell>
        <SpaceActions spaceId={space.id} />
      </ActionsCell>
    </ItemRow>
  );
};

export default SpaceRow;
