import React, {
  memo,
  useCallback,
  useEffect,
  useState,
  lazy,
  Suspense,
} from 'react';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

// services
import {
  IIdeaCustomFieldData,
  IUpdatedIdeaCustomFieldProperties /* Visibility */,
} from 'modules/commercial/idea_custom_fields/services/ideaCustomFields';

// components
import {
  IconTooltip,
  Spinner,
  Toggle,
  Accordion,
} from '@citizenlab/cl2-component-library';
const QuillMutilocWithLocaleSwitcher = lazy(
  () => import('components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher')
);

// i18n
import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const CustomFieldTitle = styled.div`
  flex: 1;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.l}px;
  line-height: normal;
  font-weight: 500;
`;

const StyledAccordion = styled(Accordion)`
  border-bottom: solid 0px ${colors.separation};
`;

const HeadingContainer = styled.div`
  padding-top: 15px;
  padding-bottom: 15px;
`;

const CollapsedContainer = styled.div`
  padding-top: 10px;
  margin-bottom: 25px;
  width: 100%;
`;

const Toggles = styled.div`
  margin-bottom: 30px;
`;

const LocaleSwitcherLabelText = styled.span`
  font-weight: 500;
  color: ${colors.adminTextColor};
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

    const handleCollapseExpand = useCallback(() => {
      onCollapseExpand(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ideaCustomField]);

    if (!isNilOrError(ideaCustomField)) {
      return (
        <Container className={`${className || ''}`}>
          <StyledAccordion
            title={
              <HeadingContainer
                onMouseDown={removeFocusAfterMouseClick}
                onClick={handleCollapseExpand}
                className={`
                e2e-${ideaCustomField.attributes.code}-setting-collapsed
              `}
              >
                <CustomFieldTitle>
                  <T value={ideaCustomField.attributes.title_multiloc} />
                </CustomFieldTitle>
              </HeadingContainer>
            }
            isOpenByDefault={!collapsed}
          >
            <CollapsedContainer>
              <Toggles>
                {canSetEnabled && (
                  <ToggleContainer>
                    <StyledToggle
                      checked={fieldEnabled}
                      onChange={handleEnabledOnChange}
                      label={<FormattedMessage {...messages.enabled} />}
                      labelTextColor={colors.adminTextColor}
                      className={`
                        e2e-${ideaCustomField.attributes.code}-enabled-toggle-label
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
                      labelTextColor={colors.adminTextColor}
                      className={`
                          e2e-${ideaCustomField.attributes.code}-required-toggle-label
                      `}
                    />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...messages.requiredTooltipContent}
                        />
                      }
                    />
                  </ToggleContainer>
                )}
              </Toggles>

              {fieldEnabled && (
                <Suspense fallback={<Spinner />}>
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
                </Suspense>
              )}
            </CollapsedContainer>
          </StyledAccordion>
        </Container>
      );
    }

    return null;
  }
);
