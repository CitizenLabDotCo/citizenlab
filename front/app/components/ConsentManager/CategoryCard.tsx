import React, { Fragment, FormEvent } from 'react';
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { transparentize } from 'polished';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Radio } from '@citizenlab/cl2-component-library';
import { getDestinationConfig, IDestination, TCategory } from './destinations';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';
import { IAppConfigurationData } from 'services/appConfiguration';

const Container = styled.div`
  display: flex;
  padding: 20px;
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: ${transparentize(0.95, colors.primary)};
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
  handleChange: (
    category: TConsentCategory,
    value: boolean
  ) => (e: FormEvent<HTMLInputElement>) => void;
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

const CategoryCard = ({
  category,
  destinations,
  checked,
  handleChange,
  disableUncheck,
}: Props) => {
  const appConfig = useAppConfiguration();

  return (
    <Container className="e2e-category">
      <TextContainer>
        <FormattedMessage
          tagName="h2"
          {...{
            functional: messages.functional,
            advertising: messages.advertising,
            analytics: messages.analytics,
            required: messages.required,
          }[category]}
        />
        <StyledFieldset>
          <Radio
            onChange={handleChange(category, true)}
            currentValue={checked}
            value={true}
            name={category}
            id={`${category}-radio-true`}
            label={<FormattedMessage {...messages.allow} />}
            isRequired
          />
          <Radio
            onChange={handleChange(category, false)}
            currentValue={checked}
            value={false}
            name={category}
            id={`${category}-radio-false`}
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
                    tenant={!isNilOrError(appConfig) ? appConfig : null}
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
