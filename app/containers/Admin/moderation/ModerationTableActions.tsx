import React, { memo, useCallback } from 'react';

// Components
import Checkbox from 'components/UI/Checkbox';

// I18n
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from './messages';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  min-height: 60px;
  display: flex;
  align-items: center;
  padding-bottom: 15px;
  padding-left: 5px;
  padding-right: 5px;
  margin-bottom: 10px;
  border-bottom: solid 1px ${colors.adminTextColor};
  user-select: none;
`;

interface Props {
  className?: string;
}

const ModerationTableActions = memo<Props>(({ className }) => {
  // const handleOnSelectAll = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
  //   if (!isNilOrError(list)) {
  //     event.preventDefault();
  //     const newSelectedRows = selectedRows.length < list.length ? list.map(item => item.id) : [];
  //     setSelectedRows(newSelectedRows);
  //   }
  // }, [list, selectedRows]);

  const handleOnSelectAll = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  return (
    <Container className={className}>
      {/* <SelectAllCheckbox
        label={
          <SelectAllCheckboxLabel>
            <FormattedMessage {...messages.select} />
            {selectedCount > 0 &&
              <UserCount className="e2e-selected-count">
                (<FormattedMessage {...messages.userCount} values={{ count: selectedCount }} />)
              </UserCount>
            }
          </SelectAllCheckboxLabel>
        }
        checked={(selectedUsers === 'all')}
        onChange={this.toggleAllUsers}
      /> */}

      {/* <StyledCheckbox
        checked={selectedRows.length === list.length}
        indeterminate={selectedRows.length > 0 && selectedRows.length !== list.length}
        onChange={handleOnSelectAll}
      /> */}

      <Checkbox
        checked={false}
        indeterminate={false}
        onChange={handleOnSelectAll}
      />
    </Container>
  );
});

export default ModerationTableActions;
