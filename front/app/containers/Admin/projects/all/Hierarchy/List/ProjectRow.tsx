import React from 'react';

import {
  Icon,
  Image,
  Td,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import useProjectImage from 'api/project_images/useProjectImage';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { parseBackendDateString } from 'utils/dateUtils';

import ManagerBubbles from '../../_shared/ManagerBubbles';
import ProjectActions from '../Actions/ProjectActions';
import { ArrangePlace } from '../Arrange/arrangeTargets';
import { ACCESS_MESSAGES } from '../labels';
import messages from '../messages';
import useProjectLabels from '../useProjectLabels';

import ActionsCell from './ActionsCell';
import { ColumnKey } from './columns';
import ItemRow from './ItemRow';
import TextCell from './TextCell';
import TitleCell from './TitleCell';
import { Managers } from './useManagers';

interface Props {
  project: ProjectMiniAdminData;
  columns: ColumnKey[];
  managers: Managers;
  participants?: number;
  path?: string;
  // Where it can be arranged, when it can.
  place?: ArrangePlace;
}

const ProjectRow = ({
  project,
  columns,
  managers,
  participants,
  path,
  place,
}: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const localize = useLocalize();
  const { status, method, when } = useProjectLabels(project);
  const {
    title_multiloc,
    visible_to,
    listed,
    first_phase_start_date,
    last_phase_end_date,
  } = project.attributes;

  const { data: image } = useProjectImage({
    projectId: project.id,
    imageId: project.relationships.project_images.data[0]?.id,
  });
  const versions = image?.data.attributes.versions;
  // Project images only come in the large version.
  const imageUrl = versions?.large ?? versions?.medium;

  const date = (value: string | null) =>
    value
      ? formatDate(parseBackendDateString(value), {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : formatMessage(messages.notSet);

  const cell = (column: ColumnKey) => {
    switch (column) {
      case 'project':
        return (
          <TitleCell
            key={column}
            lead={
              imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  width="100%"
                  height="100%"
                  objectFit="cover"
                />
              ) : (
                <Icon
                  name="image"
                  width="14px"
                  height="14px"
                  fill={colors.coolGrey500}
                />
              )
            }
            title={localize(title_multiloc)}
            target={{ projectId: project.id }}
            note={path}
          />
        );
      case 'status':
        return <TextCell key={column}>{status}</TextCell>;
      case 'phase':
        return (
          <TextCell key={column}>
            {method && (
              <Text
                as="span"
                m="0"
                variant="boMicro"
                color="coolGrey700"
                whiteSpace="nowrap"
              >
                {method}{' '}
              </Text>
            )}
            <Text
              as="span"
              m="0"
              variant="boMicro"
              color="coolGrey500"
              whiteSpace="nowrap"
            >
              {when}
            </Text>
          </TextCell>
        );
      case 'managers':
        return (
          <Td key={column}>
            <ManagerBubbles managers={managers} />
          </Td>
        );
      case 'participants':
        return (
          <TextCell key={column} numeric>
            {participants}
          </TextCell>
        );
      case 'access':
        return (
          <TextCell key={column}>
            {formatMessage(ACCESS_MESSAGES[visible_to])}
            {!listed && (
              <Text as="span" m="0" variant="boMicro" color="coolGrey500">
                {` · ${formatMessage(messages.onlyByLink)}`}
              </Text>
            )}
          </TextCell>
        );
      case 'participation_method':
        return <TextCell key={column}>{method}</TextCell>;
      case 'start_date':
        return <TextCell key={column}>{date(first_phase_start_date)}</TextCell>;
      case 'end_date':
        return <TextCell key={column}>{date(last_phase_end_date)}</TextCell>;
    }
  };

  return (
    <ItemRow>
      {columns.map(cell)}
      <ActionsCell>
        <ProjectActions project={project} place={place} />
      </ActionsCell>
    </ItemRow>
  );
};

export default ProjectRow;
