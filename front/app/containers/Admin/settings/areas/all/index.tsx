import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// components
import {
  SortableList,
  SortableRow,
  TextCell,
} from 'components/admin/ResourceList';
import {
  Section,
  SectionDescription,
  SectionTitle,
} from 'components/admin/Section';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import { Box, IconTooltip, colors } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

// resources
import useAreas from 'hooks/useAreas';
import useCustomPages from 'hooks/useCustomPages';
import { reorderArea, IAreaData, deleteArea } from 'services/areas';
import AreaTermConfig from './AreaTermConfig';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import T from 'components/T';
import useLocalize from 'hooks/useLocalize';
import messages from '../messages';

export const StyledLink = styled(Link)`
  color: ${colors.white} !important;
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

const AreaList = () => {
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
    reorderArea(areaId, newOrder);
  };

  const areas = useAreas({ includeStaticPages: true });

  if (isNilOrError(areas)) return null;

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
        <Button
          buttonStyle="cl-blue"
          icon="plus-circle"
          linkTo="/admin/settings/areas/new"
        >
          <FormattedMessage {...messages.addAreaButton} />
        </Button>
      </ButtonWrapper>
      <SortableList
        items={areas}
        onReorder={handleReorderArea}
        className="areas-list e2e-admin-areas-list"
        id="e2e-admin-areas-list"
        key={areas.length}
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

  const staticPageIds = item.relationships.static_pages.data.map(
    (page) => page.id
  );
  const staticPages = useCustomPages({ ids: staticPageIds });

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
      {staticPageIds.length > 0 && !isNilOrError(staticPages) && (
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
      <Button
        onClick={handleDeleteClick(item.id)}
        buttonStyle="text"
        icon="delete"
        disabled={staticPageIds.length > 0}
      >
        <FormattedMessage {...messages.deleteButtonLabel} />
      </Button>
      <Button
        linkTo={`/admin/settings/areas/${item.id}`}
        buttonStyle="secondary"
        icon="edit"
      >
        <FormattedMessage {...messages.editButtonLabel} />
      </Button>
    </SortableRow>
  );
};

export default AreaList;
