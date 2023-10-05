import React from 'react';
import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import T from 'components/T';
import { IAreaData } from 'api/areas/types';
import useUpdateArea from 'api/areas/useUpdateArea';
import Error from 'components/UI/Error';
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

interface Props {
  area: IAreaData;
}

const UpdateOnboardingArea = ({ area }: Props) => {
  const { mutate: updateArea, isLoading, error } = useUpdateArea();
  const { formatMessage } = useIntl();
  const color = area.attributes.include_in_onboarding
    ? colors.success
    : colors.coolGrey300;
  const iconName = area.attributes.include_in_onboarding
    ? 'check-circle'
    : 'plus-circle';

  const onClick = () => {
    updateArea({
      id: area.id,
      include_in_onboarding: !area.attributes.include_in_onboarding,
    });
  };

  return (
    <>
      <Badge color={color} onClick={onClick}>
        <Button
          buttonStyle="text"
          icon={iconName}
          iconColor={color}
          iconPos="right"
          padding="0px"
          my="0px"
          processing={isLoading}
        >
          <T value={area.attributes.title_multiloc} />
        </Button>
      </Badge>
      {error && <Error text={formatMessage(messages.areaUpdateError)} />}
    </>
  );
};

export default UpdateOnboardingArea;
