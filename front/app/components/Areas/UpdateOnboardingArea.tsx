import React from 'react';

import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IAreaData } from 'api/areas/types';
import useUpdateArea from 'api/areas/useUpdateArea';

import T from 'components/T';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  area: IAreaData;
}

const UpdateOnboardingArea = ({ area }: Props) => {
  const { mutate: updateArea, isLoading, error } = useUpdateArea();
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const iconName = area.attributes.include_in_onboarding
    ? 'check-circle'
    : 'plus-circle';
  const areaButtonContentColor = area.attributes.include_in_onboarding
    ? colors.white
    : theme.colors.tenantPrimary;
  const className = area.attributes.include_in_onboarding ? 'inverse' : '';

  const onClick = () => {
    updateArea({
      id: area.id,
      include_in_onboarding: !area.attributes.include_in_onboarding,
    });
  };

  return (
    <>
      <Badge
        color={theme.colors.tenantPrimary}
        className={className}
        onClick={onClick}
      >
        <Button
          buttonStyle="text"
          icon={iconName}
          iconPos="right"
          padding="0px"
          my="0px"
          processing={isLoading}
          textColor={areaButtonContentColor}
          iconColor={areaButtonContentColor}
        >
          <T value={area.attributes.title_multiloc} />
        </Button>
      </Badge>
      {error && <Error text={formatMessage(messages.areaUpdateError)} />}
    </>
  );
};

export default UpdateOnboardingArea;
