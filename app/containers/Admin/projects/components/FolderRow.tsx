import React, { memo } from 'react';

// components
import Icon from 'components/UI/Icon';
import { RowContent, RowContentInner, RowTitle, RowButton, ActionsRowContainer } from './StyledComponents';

// styles
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { IAdminPublicationContent } from 'hooks/useAdminPublications';

const FolderIcon = styled(Icon)`
  margin-right: 10px;
  height: 14px;
  width: 17px;
`;

interface Props {
  publication: IAdminPublicationContent;
}

const FolderRow = memo<Props>(({ publication }) => {
  return (
    <RowContent className="e2e-admin-projects-list-item">
      <RowContentInner className="expand primary">
        <FolderIcon name="simpleFolder" />
        <RowTitle value={publication.attributes.publication_title_multiloc} />
      </RowContentInner>
      <ActionsRowContainer>
        <RowButton
          className={`e2e-admin-edit-project ${publication.attributes.publication_title_multiloc?.['en-GB'] || ''}`}
          linkTo={`/admin/projects/folders/${publication.publicationId}`}
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
