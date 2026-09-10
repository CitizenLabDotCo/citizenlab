import React, { useState } from 'react';

import { Box, IconTooltip, colors } from '@citizenlab/cl2-component-library';

import { IAreaData } from 'api/areas/types';
import useAreas from 'api/areas/useAreas';
import useDeleteArea from 'api/areas/useDeleteArea';
import useReorderArea from 'api/areas/useReorderArea';
import useCustomPages from 'api/custom_pages/useCustomPages';

import useLocalize from 'hooks/useLocalize';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { TextCell } from 'components/admin/ResourceList';
import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import {
  Section,
  SectionDescription,
  SectionTitle,
} from 'components/admin/Section';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import TypedDeleteConfirmationModal from 'components/UI/TypedDeleteConfirmationModal';
import typedDeleteConfirmationMessages from 'components/UI/TypedDeleteConfirmationModal/messages';

import { FormattedMessage } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';

import messages from '../messages';

import AreaTermConfig from './AreaTermConfig';

export const StyledLink = typedStyled(Link)`
  color: ${colors.white} !important;
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

const AreaList = () => {
  const { data: areas } = useAreas({ includeStaticPages: true });
  const { mutate: deleteArea } = useDeleteArea();
  const { mutate: reorderArea } = useReorderArea();

  const localize = useLocalize();

  const [areaToDelete, setAreaToDelete] = useState<IAreaData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (area: IAreaData) => (event: React.FormEvent) => {
    event.preventDefault();
    setAreaToDelete(area);
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setAreaToDelete(null);
    }
  };

  const handleDeleteArea = () => {
    if (!areaToDelete) return;

    setIsDeleting(true);

    deleteArea(areaToDelete.id, {
      onSettled: () => {
        setIsDeleting(false);
        setAreaToDelete(null);
      },
    });
  };

  const handleReorderArea = (areaId: string, newOrder: number) => {
    reorderArea({ id: areaId, ordering: newOrder });
  };

  if (!areas) return null;

  return (
    <Section>
      <SectionTitle>
        <FormattedMessage {...messages.titleAreas} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.subtitleAreas} />
      </SectionDescription>

      <AreaTermConfig />

      <ButtonWrapper>
        <ButtonWithLink
          buttonStyle="admin-dark"
          icon="plus-circle"
          to="/admin/settings/areas/new"
        >
          <FormattedMessage {...messages.addAreaButton} />
        </ButtonWithLink>
      </ButtonWrapper>
      <SortableList
        items={areas.data}
        onReorder={handleReorderArea}
        className="areas-list e2e-admin-areas-list"
        id="e2e-admin-areas-list"
        key={areas.data.length}
      >
        {({ itemsList, handleDragRow, handleDropRow }) => (
          <>
            {itemsList.map((item: IAreaData, index: number) => {
              return (
                <AreaListRow
                  key={item.id}
                  isLastItem={index === itemsList.length - 1}
                  item={item}
                  index={index}
                  handleDeleteClick={handleDeleteClick}
                  handleDropRow={handleDropRow}
                  handleDragRow={handleDragRow}
                />
              );
            })}
          </>
        )}
      </SortableList>
      <TypedDeleteConfirmationModal
        opened={!!areaToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteArea}
        title={messages.deleteAreaModalTitle}
        entityName={
          areaToDelete ? localize(areaToDelete.attributes.title_multiloc) : ''
        }
        mainWarning={messages.deleteAreaModalWarning}
        confirmationWord={
          typedDeleteConfirmationMessages.confirmationWordDelete
        }
        deleteButtonText={messages.deleteAreaButton}
        isDeleting={isDeleting}
      />
    </Section>
  );
};

interface AreaListRowProps {
  item: IAreaData;
  handleDragRow: (fromIndex: number, toIndex: number) => void;
  handleDropRow: (itemId: string, toIndex: number) => void;
  index: number;
  isLastItem: boolean;
  handleDeleteClick: (area: IAreaData) => (event: React.FormEvent) => void;
}

const AreaListRow = ({
  item,
  handleDragRow,
  handleDropRow,
  index,
  isLastItem,
  handleDeleteClick,
}: AreaListRowProps) => {
  const localize = useLocalize();

  const staticPageIds = item.relationships.static_pages?.data.map(
    (page) => page.id
  );
  const { data: pages } = useCustomPages();

  const staticPages = staticPageIds
    ? pages?.data.filter((page) => staticPageIds.includes(page.id)) || []
    : [];

  return (
    <SortableRow
      id={item.id}
      index={index}
      isLastItem={isLastItem}
      moveRow={handleDragRow}
      dropRow={handleDropRow}
    >
      <TextCell className="expand">
        <T value={item.attributes.title_multiloc} />
      </TextCell>
      {staticPageIds && staticPageIds.length > 0 && (
        <Box>
          <IconTooltip
            iconColor={colors.error}
            icon="info-outline"
            content={
              <>
                <FormattedMessage {...messages.areaIsLinkedToStaticPage} />
                <ul>
                  {staticPages.map((staticPage) => {
                    return (
                      <li key={staticPage.id}>
                        <StyledLink
                          to="/admin/pages-menu/pages/$customPageId/settings"
                          params={{ customPageId: staticPage.id }}
                        >
                          {localize(staticPage.attributes.title_multiloc)}
                        </StyledLink>
                      </li>
                    );
                  })}
                </ul>
              </>
            }
          />
        </Box>
      )}
      <ButtonWithLink
        onClick={handleDeleteClick(item)}
        buttonStyle="text"
        icon="delete"
        disabled={staticPageIds && staticPageIds.length > 0}
      >
        <FormattedMessage {...messages.deleteButtonLabel} />
      </ButtonWithLink>
      <ButtonWithLink
        to="/admin/settings/areas/$areaId"
        params={{ areaId: item.id }}
        buttonStyle="secondary-outlined"
        icon="edit"
      >
        <FormattedMessage {...messages.editButtonLabel} />
      </ButtonWithLink>
    </SortableRow>
  );
};

export default AreaList;
