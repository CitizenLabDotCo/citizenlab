import React, { memo } from 'react';
import { adopt } from 'react-adopt';

import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';

// style
import QuillEditedContent from 'components/UI/QuillEditedContent';
import { colors, fontSizes } from 'utils/styleUtils';
import styled, { withTheme } from 'styled-components';
import { get } from 'lodash-es';

interface DataProps {
  tenant: GetTenantChildProps;
}
interface InputProps {
  className?: string;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

const Container = styled.div`
  background: ${colors.lightGreyishBlue};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  border: 1px solid #E7E7E7;
`;

const TipsTitle = styled.div`
  margin-bottom: 12px;
  font-size: ${fontSizes.large}px;
  line-height: 24px;
  font-weight: 600;
`;

const StyledQuillEditedContent = styled(QuillEditedContent)`
  span:last-child ol, span:last-child ul {
    margin-bottom: 0px;
  }
`;

const TipsBox = memo(({ tenant, className, theme }: Props) => {
  const eligibilityCriteriaMultiloc = get(tenant, 'attributes.settings.initiatives.eligibility_criteria');

  return (
    <Container className={className}>
      <TipsTitle>
        <FormattedMessage {...messages.tipsTitle} />
      </TipsTitle>
      <p>
        <FormattedMessage {...messages.tipsExplanation} />
      </p>
      <p>
        <FormattedMessage {...messages.requirmentsListTitle} />
      </p>
      <ul>
        <li>
          <FormattedMessage
            {...messages.requirmentVoteTreshold}
            values={{
              voteThreshold: get(tenant, 'attributes.settings.initiatives.voting_threshold'),
            }}
          />
        </li>
        <li>
          <FormattedMessage
            {...messages.requirmentDaysLimit}
            values={{
              daysLimit: get(tenant, 'attributes.settings.initiatives.days_limit'),
            }}
          />
        </li>
      </ul>
      {eligibilityCriteriaMultiloc &&
        <>
          <p>
            <FormattedMessage {...messages.eligibility} />
          </p>
          <StyledQuillEditedContent textColor={theme.colorText}>
            <T value={eligibilityCriteriaMultiloc}  supportHtml={true}/>
          </StyledQuillEditedContent>
        </>
      }
    </Container>
  );
});

const Data = adopt<DataProps,  InputProps>({
  tenant: <GetTenant/>
});

const TipsBoxWithTheme = withTheme(TipsBox);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <TipsBoxWithTheme {...inputProps} {...dataProps} />}
  </Data>
);
