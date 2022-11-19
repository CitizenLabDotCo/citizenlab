import React, { useEffect, useState } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// styles
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import {
  Dropdown,
  DropdownListItem,
  Button,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import RenameInsightsView from './RenameInsightsView';
import ProjectButton from './ProjectButton';
import ProjectsDropdown from './ProjectsDropdown';

// intl
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// utils
import clHistory from 'utils/cl-router/history';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError, isError } from 'utils/helperUtils';

// services
import { deleteInsightsView } from '../../../services/insightsViews';

// hooks
import useInsightsView from '../../../hooks/useInsightsView';

export const topBarHeight = 60;

const Container = styled.div`
  display: flex;
  height: ${topBarHeight}px;
  justify-content: space-between;
  align-items: center;
  padding: 12px 40px;
  position: relative;
  z-index: 1;
  box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 10%);
  // TODO : set bg color in component library
  background: #fbfbfb;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 {
    margin: 0;
    margin-right: 30px;
    font-size: ${fontSizes.xl}px;
  }
`;

const DropdownWrapper = styled.div`
  display: flex;
  color: ${colors.textSecondary};
  align-items: center;
  position: relative;
  .dropdown {
    right: 10px;
    top: 40px;
  }
`;

const TopBar = ({
  params,
  intl: { formatMessage },
}: WithRouterProps & WrappedComponentProps) => {
  const [renameModalOpened, setRenameModalOpened] = useState(false);
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const viewId = params.viewId;
  const view = useInsightsView(viewId);

  useEffect(() => {
    if (isError(view)) {
      clHistory.push('/admin/insights');
    }
  }, [view]);

  if (isNilOrError(view)) {
    return null;
  }

  const projectIds = view?.data.relationships?.data_sources.data.map(
    (project) => project.id
  );
  const toggleDropdown = () => {
    setDropdownOpened(!isDropdownOpened);
  };

  const closeDropdown = () => {
    setDropdownOpened(false);
  };

  const closeRenameModal = () => setRenameModalOpened(false);
  const openRenameModal = () => setRenameModalOpened(true);

  const handleDeleteClick = async () => {
    const deleteMessage = formatMessage(messages.deleteConfirmation);

    if (window.confirm(deleteMessage)) {
      await deleteInsightsView(viewId);
      clHistory.push('/admin/insights');
    }
  };

  return (
    <Container data-testid="insightsTopBar">
      <TitleContainer>
        <h1>{view?.data.attributes.name}</h1>
        {projectIds && projectIds.length > 0 && (
          <>
            {projectIds.length === 1 && (
              <ProjectButton projectId={projectIds[0]} />
            )}

            {projectIds.length > 1 && (
              <ProjectsDropdown projectIds={projectIds} />
            )}
          </>
        )}
      </TitleContainer>
      <DropdownWrapper>
        {formatMessage(messages.options)}
        <Button
          icon="dots-horizontal"
          iconColor={colors.textSecondary}
          iconHoverColor={colors.textSecondary}
          boxShadow="none"
          boxShadowHover="none"
          bgColor="transparent"
          bgHoverColor="transparent"
          onClick={toggleDropdown}
        />
        <Dropdown
          opened={isDropdownOpened}
          onClickOutside={closeDropdown}
          className="dropdown"
          content={
            <>
              <DropdownListItem onClick={openRenameModal}>
                {formatMessage(messages.editName)}
              </DropdownListItem>
              <DropdownListItem onClick={handleDeleteClick}>
                {formatMessage(messages.delete)}
              </DropdownListItem>
              {/* <DropdownListItem>
                {formatMessage(messages.duplicate)}
              </DropdownListItem> */}
            </>
          }
        />
      </DropdownWrapper>
      <Modal opened={renameModalOpened} close={closeRenameModal}>
        <RenameInsightsView
          closeRenameModal={closeRenameModal}
          insightsViewId={viewId}
          originalViewName={view.data.attributes.name}
        />
      </Modal>
    </Container>
  );
};

export default withRouter(injectIntl(TopBar));
