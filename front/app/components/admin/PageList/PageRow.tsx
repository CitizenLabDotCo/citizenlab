import React from 'react';
import styled from 'styled-components';

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

interface Props {
  pageData: IPageData;
  pagePermissions: IPagePermissions;
}

export default ({
  pageData,
}: // pagePermissions,
Props) => {
  return (
    <Container>
      <TextCell className="expand">
        <T value={pageData.attributes.title_multiloc} />
      </TextCell>
    </Container>
  );
};
