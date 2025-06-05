import React, { Fragment } from 'react';

import {
  Radio,
  Title,
  colors,
  fontSizes,
  media,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAppConfigurationData } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import { getDestinationConfig, IDestination, TCategory } from '../destinations';
import messages from '../messages';

const Container = styled.div`
  display: flex;
  padding: 20px;
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid ${colors.divider};
  margin-bottom: 10px;

  &:last-child {
    margin: 0;
  }

  ${media.tablet`
    flex-wrap: wrap;
  `}
`;

const TextContainer = styled.div`
  padding: 0 20px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  p {
    color: ${colors.textSecondary};
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }

  ${media.tablet`
    padding: 0;
  `}
`;

const StyledFieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  margin-bottom: 10px;
  border: none;
`;

const Separator = styled.span`
  color: ${colors.textSecondary};
  font-weight: 400;
  font-size: ${fontSizes.base}px;
  line-height: 19px;
`;

const SSpan = styled.span`
  padding-left: 10px;
  padding-right: 10px;

  ${media.tablet`
    padding-left: 8px;
    padding-right: 8px;
`}
`;

const Tools = styled.span`
  font-weight: 500;
`;

type TConsentCategory = TCategory | 'required';

interface Props {
  category: TConsentCategory;
  destinations: IDestination[];
  checked: boolean;
  disableUncheck?: boolean;
  onChange: (category: TCategory, value: boolean) => void;
}

const DestinationName = ({
  tenant,
  destination,
}: {
  tenant: IAppConfigurationData | null;
  destination: IDestination;
}) => {
  const config = getDestinationConfig(destination);
  if (config?.name && tenant) {
    return <>{config.name(tenant)}</>;
  } else if (config) {
    return <>{config.key}</>;
  } else {
    return null;
  }
};

const RADIO_IDS_TRUE: Record<TCategory, string> = {
  advertising: 'advertising-radio-true',
  analytics: 'analytics-radio-true',
  functional: 'functional-radio-true',
};

const RADIO_IDS_FALSE: Record<TCategory, string> = {
  advertising: 'advertising-radio-false',
  analytics: 'analytics-radio-false',
  functional: 'functional-radio-false',
};

const CategoryCard = ({
  category,
  destinations,
  checked,
  onChange,
  disableUncheck,
}: Props) => {
  const { data: appConfig } = useAppConfiguration();

  const handleChange = (category: TCategory, value: boolean) => () => {
    onChange(category, value);
  };

  return (
    <Container className="e2e-category">
      <TextContainer>
        <StyledFieldset>
          <legend>
            <Title variant="h4" as="h2">
              <FormattedMessage
                {...{
                  functional: messages.functional,
                  advertising: messages.advertising,
                  analytics: messages.analytics,
                  required: messages.required,
                }[category]}
              />
            </Title>
          </legend>
          <Radio
            onChange={
              category === 'required' ? undefined : handleChange(category, true)
            }
            currentValue={checked}
            value={true}
            name={category}
            id={RADIO_IDS_TRUE[category]}
            label={<FormattedMessage {...messages.allow} />}
            isRequired
          />
          <Radio
            onChange={
              category === 'required'
                ? undefined
                : handleChange(category, false)
            }
            currentValue={checked}
            value={false}
            name={category}
            id={RADIO_IDS_FALSE[category]}
            label={<FormattedMessage {...messages.disallow} />}
            isRequired
            disabled={disableUncheck}
          />
        </StyledFieldset>
        <FormattedMessage
          tagName="p"
          {...{
            functional: messages.functionalPurpose,
            advertising: messages.advertisingPurpose,
            analytics: messages.analyticsPurpose,
            required: messages.requiredPurpose,
          }[category]}
        />
        {destinations.length > 0 && (
          <p>
            <Tools>
              <FormattedMessage {...messages.tools} />:
            </Tools>
            {destinations.map((d, index) => (
              <Fragment key={d}>
                {index !== 0 && <Separator>•</Separator>}
                <SSpan>
                  <DestinationName
                    tenant={!isNilOrError(appConfig) ? appConfig.data : null}
                    destination={d}
                  />
                </SSpan>
              </Fragment>
            ))}
          </p>
        )}
      </TextContainer>
    </Container>
  );
};

export default CategoryCard;
