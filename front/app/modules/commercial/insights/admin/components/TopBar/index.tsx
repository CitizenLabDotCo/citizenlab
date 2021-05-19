import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// styles
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';
import { lighten } from 'polished';

// components
import {
  Dropdown,
  DropdownListItem,
  Button,
  Icon,
} from 'cl2-component-library';
import Modal from 'components/UI/Modal';
import RenameInsightsView from './RenameInsightsView';
import T from 'components/T';

// intl
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import clHistory from 'utils/cl-router/history';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

// services
import { deleteInsightsView } from '../../../services/insightsViews';

// hooks
import useProject from 'hooks/useProject';
import useInsightsView from '../../../hooks/useInsightsView';
import useLocale from 'hooks/useLocale';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: ${lighten('0.1', colors.adminBackground)};
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 {
    margin: 0;
    margin-right: 30px;
    fontsize: ${fontSizes.xl};
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

const ProjectButtonContent = styled.span`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .linkIcon {
    width: 20px;
    margin-left: 8px;
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

  const project = useProject({
    projectId: !isNilOrError(view) ? view.relationships?.scope.data.id : null,
  });

  if (isNilOrError(view) || isNilOrError(locale)) {
    return null;
  }

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
    <Container>
      <TitleContainer>
        <h1>{view.attributes.name}</h1>
        {!isNilOrError(project) && (
          <Button
            locale={locale}
            buttonStyle="secondary-outlined"
            linkTo={`/${project.attributes.slug}`}
            fontSize={`${fontSizes.small}px`}
            padding={'6px 8px'}
          >
            <ProjectButtonContent>
              <T value={project.attributes.title_multiloc} />
              <Icon name="link" className="linkIcon" />
            </ProjectButtonContent>
          </Button>
        )}
      </TitleContainer>
      <DropdownWrapper>
        {formatMessage(messages.options)}
        <Button
          icon="more-options"
          locale={locale}
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
              <DropdownListItem>
                {formatMessage(messages.duplicate)}
              </DropdownListItem>
            </>
          }
        />
      </DropdownWrapper>
      <Modal opened={renameModalOpened} close={closeRenameModal}>
        <RenameInsightsView
          closeRenameModal={closeRenameModal}
          insightsViewId={viewId}
        />
      </Modal>
    </Container>
  );
};

export default injectIntl<{}>(withRouter(TopBar));
