import React, { memo } from 'react';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import styled, { withTheme } from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// hooks
import useTenant from 'hooks/useTenant';

const Container = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  padding: 20px;
`;

const StyledQuillEditedContent = styled(QuillEditedContent)`
  span:last-child ol, span:last-child ul {
    margin-bottom: 0px;
  }
`;

interface Props {
  theme: any;
}

const TipsContent = memo<Props>((props) => {
  const tenant = useTenant();

  if (!isNilOrError(tenant)) {
    const eligibilityCriteriaMultiloc = tenant.data.attributes.settings.initiatives?.eligibility_criteria;

    return (
      <Container>
        <p>
          <FormattedMessage {...messages.tipsExplanation} />
        </p>
        {eligibilityCriteriaMultiloc &&
          <>

            <StyledQuillEditedContent textColor={props.theme.colorText}>
              <T value={eligibilityCriteriaMultiloc}  supportHtml={true}/>
            </StyledQuillEditedContent>
          </>
        }
      </Container>
    );
  }

  return null;
});

export default withTheme(TipsContent);
