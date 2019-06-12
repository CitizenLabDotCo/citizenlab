import React, { memo } from 'react';
import { adopt } from 'react-adopt';

import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';

// style
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';
import { get } from 'lodash-es';

interface DataProps {
  tenant: GetTenantChildProps;
}
interface InputProps {
  className?: string;
}

interface Props extends InputProps, DataProps {}

const Container = styled.div`
  background: ${colors.lightGreyishBlue};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colorText};
`;

const TipsTitle = styled.div`
  margin-bottom: 12px;
  font-size: ${fontSizes.large}px;
  line-height: 24px;
  font-weight: 600;
`;

const SubP = styled.p`
  &:not(:last-child) {
    margin-bottom: 20px;
  }
`;

const TipsBox = memo(({ tenant, className }: Props) => {
  const eligibilityCriteriaMultiloc = get(tenant, 'attributes.settings.initiatives.eligibility_criteria');

  return (
    <Container className={className}>
      <TipsTitle>
        <FormattedMessage {...messages.tipsTitle} />
      </TipsTitle>
      <p>
        <FormattedMessage {...messages.tipsExplanation} />
      </p>
      <SubP>
        <FormattedMessage {...messages.requirmentsListTitle} />
      </SubP>
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
          <SubP>
            <T value={eligibilityCriteriaMultiloc}/>
          </SubP>
        </>
      }
    </Container>
  );
});

const Data = adopt<DataProps,  InputProps>({
  tenant: <GetTenant/>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <TipsBox {...inputProps} {...dataProps} />}
  </Data>
);
