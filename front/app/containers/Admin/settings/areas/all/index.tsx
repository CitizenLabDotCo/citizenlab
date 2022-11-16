import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

import useAreas from 'hooks/useAreas';
import { reorderArea, IAreaData, deleteArea } from 'services/areas';

import messages from '../messages';
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';

import useLocalize from 'hooks/useLocalize';

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
import AreaTermConfig from './AreaTermConfig';
import { Box, colors, IconTooltip } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import useCustomPage from 'hooks/useCustomPage';

export const StyledLink = styled(Link)`
  color: ${colors.white} !important;
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }
`;

interface InputProps {}

interface Props extends InputProps, WrappedComponentProps {}

const AreaRow = ({
  item,
  handleDragRow,
  handleDropRow,
  index,
  isLastItem,
  handleDeleteClick,
}) => {
  const localize = useLocalize();

  if (isNilOrError(item)) return null;
  const { static_page_ids } = item.attributes;

  const staticPages = static_page_ids.map((customPageId) => {
    const result = useCustomPage({ customPageId });
    if (!isNilOrError(result)) {
      return result;
    }
    return null;
  });

  const staticPageContent = (
    <>
      <FormattedMessage {...messages.areaIsLinkedToStaticPage} />
      <ul>
        {staticPages.map((staticPage) => {
          if (staticPage == null) {
            return null;
          }

          return (
            <li>
              <StyledLink
                to={`/admin/pages-menu/pages/${staticPage.id}/settings`}
              >
                {localize(staticPage?.attributes.title_multiloc)}
              </StyledLink>
            </li>
          );
        })}
      </ul>
    </>
  );

  return (
    <SortableRow
      key={item.id}
      id={item.id}
      index={index}
      isLastItem={isLastItem}
      moveRow={handleDragRow}
      dropRow={handleDropRow}
    >
      <TextCell className="expand">
        <T value={item.attributes.title_multiloc} />
      </TextCell>
      {item.attributes.static_page_ids.length > 0 && (
        <Box>
          <IconTooltip
            iconColor={colors.error}
            icon="info-outline"
            content={staticPageContent}
          />
        </Box>
      )}
      <Button
        onClick={handleDeleteClick(item.id)}
        buttonStyle="text"
        icon="delete"
        disabled={item.attributes.static_page_ids.length > 0}
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

const AreaList = (props: Props) => {
  const handleDeleteClick =
    (areaId: string) => (event: React.FormEvent<any>) => {
      const deleteMessage = props.intl.formatMessage(
        messages.areaDeletionConfirmation
      );
      event.preventDefault();

      if (window.confirm(deleteMessage)) {
        deleteArea(areaId);
      }
    };

  const handleReorderArea = (areaId: string, newOrder: number) => {
    reorderArea(areaId, newOrder);
  };

  const areas = useAreas();

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
              console.log({ item });
              return (
                <AreaRow
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

export default AreaList;
