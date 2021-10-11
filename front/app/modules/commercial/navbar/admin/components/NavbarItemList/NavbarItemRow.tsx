import React from 'react';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import { TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import T from 'components/T';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { INavbarItem } from 'services/navbar';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 50px;
  align-items: center;
  justify-content: space-between;
`;

const DefaultTag = styled.div`
  display: inline-block;
  color: ${colors.label};
  background-color: ${colors.lightGreyishBlue};
  font-weight: bold;
  font-size: 12px;
  padding: 0px 6px;
  margin-left: 15px;
  transform: translateY(-2px);
  border-radius: 3px;
`;

interface Props {
  navbarItem: INavbarItem;
  isDefaultPage?: boolean;
  showAddButton?: boolean;
  addButtonDisabled?: boolean;
  showRemoveButton?: boolean;
  onClickAddButton?: (id: string) => void;
  onClickRemoveButton?: (id: string) => void;
}

export default ({
  navbarItem,
  isDefaultPage,
  showAddButton,
  addButtonDisabled,
  showRemoveButton,
  onClickAddButton,
  onClickRemoveButton,
}: Props) => {
  const handleOnClickAddButton = () => {
    if (onClickAddButton) onClickAddButton(navbarItem.id);
  };

  const handleOnClickRemoveButton = () => {
    if (onClickRemoveButton) onClickRemoveButton(navbarItem.id);
  };

  return (
    <Container data-testid="navbar-item-row">
      <TextCell className="expand">
        <T value={navbarItem.attributes.title_multiloc} />

        {isDefaultPage && (
          <DefaultTag data-testid="default-tag">
            <FormattedMessage {...messages.defaultTag} />
          </DefaultTag>
        )}
      </TextCell>

      {showAddButton && (
        <Button
          buttonStyle="secondary"
          onClick={handleOnClickAddButton}
          disabled={addButtonDisabled}
        >
          <FormattedMessage {...messages.addButton} />
        </Button>
      )}

      {showRemoveButton && (
        <Button buttonStyle="secondary" onClick={handleOnClickRemoveButton}>
          <FormattedMessage {...messages.removeButton} />
        </Button>
      )}
    </Container>
  );
};
