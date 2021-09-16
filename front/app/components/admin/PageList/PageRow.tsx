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
import { IPageData } from 'services/pages';
import { IPagePermissions } from '.';

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
  pageData: IPageData;
  pagePermissions: IPagePermissions;
  onClickAddButton?: (id: string) => void;
}

export default ({ pageData, pagePermissions, onClickAddButton }: Props) => {
  const handleOnClickAddButton = () => {
    if (onClickAddButton) onClickAddButton(pageData.id);
  };

  return (
    <Container data-testid="page-row">
      <TextCell className="expand">
        <T value={pageData.attributes.title_multiloc} />

        {pagePermissions.isDefaultPage && (
          <DefaultTag data-testid="default-tag">
            <FormattedMessage {...messages.defaultTag} />
          </DefaultTag>
        )}
      </TextCell>

      {pagePermissions.hasAddButton && (
        <Button buttonStyle="secondary" onClick={handleOnClickAddButton}>
          <FormattedMessage {...messages.addButton} />
        </Button>
      )}

      {/* {pagePermissions.hasRemoveButton && (
        
      )} */}
    </Container>
  );
};
