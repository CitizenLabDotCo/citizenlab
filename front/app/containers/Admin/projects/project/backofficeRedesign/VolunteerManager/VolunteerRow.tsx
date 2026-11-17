import React from 'react';

import { IUserData } from 'api/users/types';
import { IVolunteerData } from 'api/volunteers/types';

import { Cell, Row } from 'design-system/Table';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import styles from './VolunteerManager.module.css';

interface Props {
  volunteer: IVolunteerData;
  user: IUserData | undefined;
  causeTitle: string | undefined;
}

const VolunteerRow = ({ volunteer, user, causeTitle }: Props) => {
  const { formatDate } = useIntl();
  const name = user ? getFullName(user) : undefined;

  return (
    <Row id={volunteer.id} textValue={name}>
      <Cell>{name}</Cell>
      <Cell tone="secondary">{user?.attributes.email}</Cell>
      <Cell>{causeTitle}</Cell>
      <Cell tone="secondary">
        <span className={styles.date}>
          {formatDate(volunteer.attributes.created_at, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </Cell>
    </Row>
  );
};

export default VolunteerRow;
