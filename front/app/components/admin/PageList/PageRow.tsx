import React from 'react';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import { TextCell } from 'components/admin/ResourceList';
// import Button from 'components/UI/Button';
import T from 'components/T';

// i18n
// import { FormattedMessage, injectIntl } from 'utils/cl-intl';
// import { InjectedIntlProps } from 'react-intl';
// import messages from './messages';

// typings
import { IPageData } from 'services/pages';
import { IPagePermissions } from '.';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 50px;
  justify-content: center;
`;

const DefaultTag = styled.div`
  display: inline-block;
  color: ${colors.label};
  background-color: ${colors.lightGreyishBlue};
  font-weight: bold;
  font-size: 12px;
  padding: 2px 6px;
  margin-left: 15px;
  transform: translateY(-2px);
  border-radius: 3px;
`;

interface Props {
  pageData: IPageData;
  pagePermissions: IPagePermissions;
}

export default ({ pageData, pagePermissions }: Props) => {
  return (
    <Container>
      <TextCell className="expand">
        <T value={pageData.attributes.title_multiloc} />
        {pagePermissions.isDefaultPage && <DefaultTag>DEFAULT</DefaultTag>}
      </TextCell>
    </Container>
  );
};
