import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetPages, { GetPagesChildProps } from 'resources/GetPages';

// components
import Button from 'components/UI/Button';
import FeatureFlag from 'components/FeatureFlag';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import PageList from './PageList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

export interface InputProps {}

interface DataProps {
  pages: GetPagesChildProps;
}

interface Props extends InputProps, DataProps {}

const Pages = ({ pages }: Props) => {
  if (!isNilOrError(pages)) {
    return (
      <>
        <FeatureFlag name="pages">
          <ButtonWrapper>
            <Button
              buttonStyle="cl-blue"
              icon="plus-circle"
              linkTo="/admin/pages/new"
            >
              <FormattedMessage {...messages.addPageButton} />
            </Button>
          </ButtonWrapper>
        </FeatureFlag>

        <PageList pages={pages} />
      </>
    );
  }

  return null;
};

export default (inputProps: InputProps) => (
  <GetPages>{(pages) => <Pages {...inputProps} pages={pages} />}</GetPages>
);
