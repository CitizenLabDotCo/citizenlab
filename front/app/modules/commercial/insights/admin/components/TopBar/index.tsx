import React, { useEffect, useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

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

// intl
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import clHistory from 'utils/cl-router/history';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError, isError } from 'utils/helperUtils';

// services
import { deleteInsightsView } from '../../../services/insightsViews';

// hooks
import useInsightsView from '../../../hooks/useInsightsView';
import useLocale from 'hooks/useLocale';

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
  color: ${colors.label};
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
}: WithRouterProps & InjectedIntlProps) => {
  const [renameModalOpened, setRenameModalOpened] = useState(false);
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const locale = useLocale();
  const viewId = params.viewId;
  const view = useInsightsView(viewId);

  useEffect(() => {
    if (isError(view)) {
      clHistory.push('/admin/insights');
    }
  }, [view]);

  if (isNilOrError(view) || isNilOrError(locale)) {
    return null;
  }

  const projectId = view?.data.relationships?.scope.data.id;
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
        {projectId && <ProjectButton projectId={projectId} />}
      </TitleContainer>
      <DropdownWrapper>
        {formatMessage(messages.options)}
        <Button
          locale={locale}
          icon="more-options"
          iconColor={colors.label}
          iconHoverColor={colors.label}
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
