import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import { IAdminPublicationData } from 'api/admin_publications/types';

import { Row } from 'components/admin/ResourceList';

import {
  RowContent,
  RowContentInner,
  RowTitle,
  RowButton,
} from 'containers/Admin/projects/_shared/components/StyledComponents';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  adminPublication: IAdminPublicationData;
  isLastItem: boolean;
}

const Folder = ({ adminPublication, isLastItem }: Props) => {
  const folderId = adminPublication.relationships.publication.data.id;

  return (
    <Row id={adminPublication.id} isLastItem={isLastItem}>
      <RowContent className="e2e-admin-projects-list-item">
        <Box display="flex" alignItems="center" gap="8px">
          <Icon
            name="folder-outline"
            fill={colors.textSecondary}
            width="20px"
            height="20px"
          />
          <RowContentInner className="expand primary">
            <RowTitle
              value={adminPublication.attributes.publication_title_multiloc}
            />
          </RowContentInner>
        </Box>
        <RowButton
          icon="edit"
          buttonStyle="secondary-outlined"
          to="/admin/projects/folders/$projectFolderId"
          params={{ projectFolderId: folderId }}
        >
          <FormattedMessage {...messages.editProject} />
        </RowButton>
      </RowContent>
    </Row>
  );
};

export default Folder;
