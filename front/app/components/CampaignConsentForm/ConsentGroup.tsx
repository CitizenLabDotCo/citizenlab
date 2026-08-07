import React from 'react';

import {
  Accordion,
  Box,
  CheckboxWithLabel,
  Text,
} from '@citizenlab/cl2-component-library';

import CheckboxWithPartialCheck from 'components/UI/CheckboxWithPartialCheck';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import {
  CampaignConsentChild,
  ConsentGroupView,
  ToggleConsentHandler,
  ToggleGroupHandler,
} from './typings';

interface Props {
  group: ConsentGroupView;
  onToggleGroup: ToggleGroupHandler;
  onToggleConsent: ToggleConsentHandler;
}

const ConsentGroup = ({ group, onToggleGroup, onToggleConsent }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Accordion
      title={<Text m="12px">{group.contentType}</Text>}
      prefix={
        // The accordion title sits in a sibling element, so it can't name this
        // checkbox — it gets an explicit label instead.
        <CheckboxWithPartialCheck
          id={group.id}
          checked={group.group_consented}
          onChange={onToggleGroup(group)}
          aria-label={formatMessage(messages.a11y_toggleAllInCategory, {
            contentType: group.contentType,
          })}
        />
      }
    >
      <Box ml="34px">
        <ScreenReaderOnly>
          <legend>
            <FormattedMessage {...messages.ally_categoryLabel} />
          </legend>
        </ScreenReaderOnly>
        {group.children.map(
          ({
            id,
            consented,
            campaign_type_description,
          }: CampaignConsentChild) => (
            <CheckboxWithLabel
              key={id}
              size="20px"
              mb="12px"
              checked={consented}
              onChange={onToggleConsent(id)}
              label={campaign_type_description}
            />
          )
        )}
      </Box>
    </Accordion>
  );
};

export default ConsentGroup;
