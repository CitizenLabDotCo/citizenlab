import React from 'react';

import { Box, IconTooltip, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAreaData } from 'api/areas/types';
import useAreas from 'api/areas/useAreas';
import useDeleteArea from 'api/areas/useDeleteArea';
import useUpdateArea from 'api/areas/useUpdateArea';
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

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';

import AreaTermConfig from './AreaTermConfig';

export const StyledLink = styled(Link)`
  color: ${colors.white} !important;
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

const AreaList = () => {
  const { data: areas } = useAreas({ includeStaticPages: true });
  const { mutate: deleteArea } = useDeleteArea();
  const { mutate: reorderArea } = useUpdateArea();

  const { formatMessage } = useIntl();

  const handleDeleteClick =
    (areaId: string) => (event: React.FormEvent<any>) => {
      const deleteMessage = formatMessage(messages.areaDeletionConfirmation);
      event.preventDefault();

      if (window.confirm(deleteMessage)) {
        deleteArea(areaId);
      }
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
          linkTo="/admin/settings/areas/new"
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
    </Section>
  );
};

interface AreaListRowProps {
  item: IAreaData;
  handleDragRow: (fromIndex: number, toIndex: number) => void;
  handleDropRow: (itemId: string, toIndex: number) => void;
  index: number;
  isLastItem: boolean;
  handleDeleteClick: (areaId: string) => (event: React.FormEvent<any>) => void;
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
                          to={`/admin/pages-menu/pages/${staticPage.id}/settings`}
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
        onClick={handleDeleteClick(item.id)}
        buttonStyle="text"
        icon="delete"
        disabled={staticPageIds && staticPageIds.length > 0}
      >
        <FormattedMessage {...messages.deleteButtonLabel} />
      </ButtonWithLink>
      <ButtonWithLink
        linkTo={`/admin/settings/areas/${item.id}`}
        buttonStyle="secondary-outlined"
        icon="edit"
      >
        <FormattedMessage {...messages.editButtonLabel} />
      </ButtonWithLink>
    </SortableRow>
  );
};

export default AreaList;
