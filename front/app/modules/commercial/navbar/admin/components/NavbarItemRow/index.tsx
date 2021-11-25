import React from 'react';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { Box } from 'cl2-component-library';

// components
import { TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import T from 'components/T';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { Multiloc } from 'typings';

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
  title: Multiloc;
  isDefaultPage?: boolean;
  showAddButton?: boolean;
  addButtonDisabled?: boolean;
  showRemoveButton?: boolean;
  showViewButton?: boolean;
  onClickAddButton?: () => void;
  onClickRemoveButton?: () => void;
  onClickDeleteButton?: () => void;
  onClickViewButton?: () => void;
}

export default ({
  title,
  isDefaultPage,
  showAddButton,
  addButtonDisabled,
  showRemoveButton,
  onClickAddButton,
  onClickRemoveButton,
  onClickDeleteButton,
  onClickViewButton,
}: Props) => {
  const handleOnClickAddButton = () => {
    if (onClickAddButton && !addButtonDisabled) {
      onClickAddButton();
    }
  };

  const handleOnClickRemoveButton = () => {
    if (onClickRemoveButton) onClickRemoveButton();
  };

  const handleOnClickDeleteButton = () => {
    if (onClickDeleteButton) {
      onClickDeleteButton();
    }
  };

  const handleOnClickViewButton = () => {
    if (onClickViewButton) onClickViewButton();
  };

  return (
    <Container data-testid="navbar-item-row">
      <TextCell className="expand">
        <T value={title} />

        {isDefaultPage && (
          <DefaultTag data-testid="default-tag">
            <FormattedMessage {...messages.defaultTag} />
          </DefaultTag>
        )}
      </TextCell>

      <Box display="flex" alignItems="flex-end">
        <Button
          buttonStyle="secondary"
          icon="search"
          onClick={handleOnClickViewButton}
          ml="10px"
        >
          <FormattedMessage {...messages.viewButton} />
        </Button>

        {!isDefaultPage && (
          <Button
            buttonStyle="secondary"
            icon="delete"
            onClick={handleOnClickDeleteButton}
            ml="10px"
          >
            <FormattedMessage {...messages.deleteButton} />
          </Button>
        )}

        {showAddButton && (
          <Button
            buttonStyle="secondary"
            onClick={handleOnClickAddButton}
            disabled={addButtonDisabled}
            ml="10px"
          >
            <FormattedMessage {...messages.addButton} />
          </Button>
        )}

        {showRemoveButton && (
          <Button
            buttonStyle="secondary"
            onClick={handleOnClickRemoveButton}
            ml="10px"
          >
            <FormattedMessage {...messages.removeButton} />
          </Button>
        )}
      </Box>
    </Container>
  );
};
