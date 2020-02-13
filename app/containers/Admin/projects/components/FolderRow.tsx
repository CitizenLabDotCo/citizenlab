import React, { memo } from 'react';

// components
import Icon from 'components/UI/Icon';
import { RowContent, RowContentInner, RowTitle, RowButton, ActionsRowContainer } from './StyledComponents';

// styles
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// types
import { IProjectFolderData } from 'services/projectFolders';

const FolderIcon = styled(Icon)`
  margin-right: 10px;
  height: 14px;
  width: 17px;
`;

interface Props {
  folder: IProjectFolderData;
}

const FolderRow = memo<Props>(({ folder }) => {
  return (
    <RowContent className="e2e-admin-projects-list-item">
      <RowContentInner className="expand primary">
        <FolderIcon name="simpleFolder" />
        <RowTitle value={folder.attributes.title_multiloc} />
      </RowContentInner>
      <ActionsRowContainer>
        <RowButton
          className={`e2e-admin-edit-project ${folder.attributes.title_multiloc['en-GB'] || ''}`}
          onClick={this.removeFolder(folder.id)}
          buttonStyle="secondary"
          icon="remove"
        >
          <FormattedMessage {...messages.deleteButtonLabel} />
        </RowButton>
        <RowButton
          className={`e2e-admin-edit-project ${folder.attributes.title_multiloc['en-GB'] || ''}`}
          linkTo={`/admin/projects/folders/${folder.id}`}
          buttonStyle="secondary"
          icon="edit"
        >
          <FormattedMessage {...messages.manageButtonLabel} />
        </RowButton>
      </ActionsRowContainer>
    </RowContent>
  );
});

export default FolderRow;
