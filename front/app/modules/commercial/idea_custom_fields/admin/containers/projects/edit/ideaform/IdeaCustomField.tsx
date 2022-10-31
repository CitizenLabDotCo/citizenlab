import React, { memo, useCallback, useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  IIdeaCustomFieldData,
  IUpdatedIdeaCustomFieldProperties /* Visibility */,
} from 'modules/commercial/idea_custom_fields/services/ideaCustomFields';

// components
import {
  IconTooltip,
  Toggle,
  Accordion,
  Box,
  Title,
} from '@citizenlab/cl2-component-library';

import QuillMutilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

// i18n
import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

const Toggles = styled.div`
  margin-bottom: 30px;
`;

const LocaleSwitcherLabelText = styled.span`
  font-weight: 500;
  color: ${colors.primary};
  font-size: ${fontSizes.m}px;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const StyledToggle = styled(Toggle)`
  margin-right: 10px;
`;

interface Props {
  ideaCustomField: IIdeaCustomFieldData;
  collapsed: boolean;
  first?: boolean;
  onCollapseExpand: (ideaCustomFieldId: string) => void;
  onChange: (
    ideaCustomFieldId: string,
    updatedProperties: IUpdatedIdeaCustomFieldProperties
  ) => void;
  className?: string;
  id: string;
}

const disablableFields = [
  'topic_ids',
  'location_description',
  'idea_files_attributes',
  'proposed_budget',
];
const alwaysRequiredFields = ['title_multiloc', 'body_multiloc'];

export default memo<Props>(
  ({
    ideaCustomField,
    collapsed,
    onChange,
    onCollapseExpand,
    className,
    id,
  }) => {
    const canSetEnabled = disablableFields.find(
      (field) => field === ideaCustomField.attributes.key
    );
    const canSetRequired = !alwaysRequiredFields.includes(
      ideaCustomField.attributes.key
    );

    const [descriptionMultiloc, setDescriptionMultiloc] = useState(
      ideaCustomField.attributes.description_multiloc
    );
    const [fieldEnabled, setFieldEnabled] = useState(
      ideaCustomField.attributes.enabled
    );
    const [fieldRequired, setFieldRequired] = useState(
      ideaCustomField.attributes.required
    );

    const handleDescriptionOnChange = useCallback(
      (description_multiloc: Multiloc) => {
        setDescriptionMultiloc(description_multiloc);
      },
      []
    );

    useEffect(() => {
      onChange(ideaCustomField.id, {
        description_multiloc: descriptionMultiloc,
      });
    }, [descriptionMultiloc, ideaCustomField, onChange]);

    const handleEnabledOnChange = useCallback(() => {
      setFieldEnabled((fieldEnabled) => !fieldEnabled);
    }, []);

    useEffect(() => {
      onChange(ideaCustomField.id, { enabled: fieldEnabled });
    }, [fieldEnabled, ideaCustomField, onChange]);

    const handleRequiredOnChange = useCallback(() => {
      setFieldRequired((fieldRequired) => !fieldRequired);
    }, []);

    useEffect(() => {
      onChange(ideaCustomField.id, { required: fieldRequired });
    }, [fieldRequired, ideaCustomField, onChange]);

    const handleCollapseExpand = () => {
      onCollapseExpand(id);
    };

    if (!isNilOrError(ideaCustomField)) {
      const { code, key, title_multiloc } = ideaCustomField.attributes;
      const e2eId = code || key;
      return (
        <Accordion
          title={
            <Box
              className={`
              e2e-${e2eId}-setting-collapsed
            `}
            >
              <Title variant="h3">
                <T value={title_multiloc} />
              </Title>
            </Box>
          }
          isOpenByDefault={!collapsed}
          onChange={handleCollapseExpand}
          className={`${className || ''}`}
        >
          <Box pt="10px" mb="25px" w="100%">
            <Toggles>
              {canSetEnabled && (
                <ToggleContainer>
                  <StyledToggle
                    checked={fieldEnabled}
                    onChange={handleEnabledOnChange}
                    label={<FormattedMessage {...messages.enabled} />}
                    labelTextColor={colors.primary}
                    className={`
                      e2e-${e2eId}-enabled-toggle-label
                    `}
                  />
                  <IconTooltip
                    content={
                      <FormattedMessage {...messages.enabledTooltipContent} />
                    }
                  />
                </ToggleContainer>
              )}
              {fieldEnabled && canSetRequired && (
                <ToggleContainer>
                  <StyledToggle
                    checked={fieldRequired}
                    onChange={handleRequiredOnChange}
                    label={<FormattedMessage {...messages.required} />}
                    labelTextColor={colors.primary}
                    className={`
                        e2e-${e2eId}-required-toggle-label
                    `}
                  />
                  <IconTooltip
                    content={
                      <FormattedMessage {...messages.requiredTooltipContent} />
                    }
                  />
                </ToggleContainer>
              )}
            </Toggles>

            {fieldEnabled && (
              <QuillMutilocWithLocaleSwitcher
                id={`${ideaCustomField.id}-description`}
                noImages={true}
                noVideos={true}
                noAlign={true}
                valueMultiloc={descriptionMultiloc}
                onChange={handleDescriptionOnChange}
                label={
                  <LocaleSwitcherLabelText>
                    <FormattedMessage {...messages.descriptionLabel} />
                  </LocaleSwitcherLabelText>
                }
              />
            )}
          </Box>
        </Accordion>
      );
    }

    return null;
  }
);
