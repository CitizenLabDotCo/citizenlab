import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import CSSTransition from 'react-transition-group/CSSTransition';

// services
import { IIdeaCustomFieldData } from 'services/ideaCustomFields';

// components
import Icon from 'components/UI/Icon';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';

// i18n
import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

const timeout = 250;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-bottom: solid 1px ${colors.separation};

  &.first {
    border-top: solid 1px ${colors.separation};
  }
`;

const CustomFieldTitle = styled.div`
  flex: 1;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  line-height: normal;
`;

const ChevronIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  fill: ${colors.label};
  margin-left: 20px;
  transition: fill 80ms ease-out,
              transform 200ms ease-out;
`;

const CollapsedContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 15px;
  padding-bottom: 15px;
  cursor: pointer;

  &.expanded {
    ${ChevronIcon} {
      transform: rotate(90deg);
    }
  }

  &:hover {
    ${ChevronIcon} {
      fill: #000;
    }
  }
`;

const CollapseContainer = styled.div`
  opacity: 0;
  display: none;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: opacity, height;

  &.collapse-enter {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;
    display: block;

    &.collapse-enter-active {
      opacity: 1;
      max-height: 200px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-enter-done {
    opacity: 1;
    overflow: visible;
    display: block;
  }

  &.collapse-exit {
    opacity: 1;
    max-height: 200px;
    overflow: hidden;
    display: block;

    &.collapse-exit-active {
      opacity: 0;
      max-height: 0px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-exit-done {
    display: none;
  }
`;

const CollapseContainerInner = styled.div`
  padding-top: 25px;
  padding-bottom: 25px;
`;

interface Props {
  ideaCustomField: IIdeaCustomFieldData;
  collapsed: boolean;
  first?: boolean;
  onCollapseExpand: (ideaCustomFieldId: string) => void;
  onChange: (ideaCustomFieldId: string, { description_multiloc: Multiloc }) => void;
  className?: string;
}

const IdeaCustomField = memo<Props>(({ ideaCustomField, collapsed, first, onChange, onCollapseExpand, className }) => {

  const [descriptionMultiloc, setDescriptionMultiloc] = useState(ideaCustomField.attributes.description_multiloc);

  const handleOnChange = useCallback((description_multiloc: Multiloc) => {
    setDescriptionMultiloc(description_multiloc);
    onChange(ideaCustomField.id, { description_multiloc });
  }, [ideaCustomField, onChange]);

  const removeFocus = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const handleCollapseExpand = useCallback(() => {
    onCollapseExpand(ideaCustomField.id);
  }, [ideaCustomField]);

  if (!isNilOrError(ideaCustomField)) {
    return (
      <Container className={`${className || ''} ${first ? 'first' : ''}`}>
        <CollapsedContent
          onMouseDown={removeFocus}
          onClick={handleCollapseExpand}
          className={collapsed ? 'collapsed' : 'expanded'}
        >
          <CustomFieldTitle>
            <T value={ideaCustomField.attributes.title_multiloc} />
          </CustomFieldTitle>
          <ChevronIcon name="chevron-right" />
        </CollapsedContent>

        <CSSTransition
          classNames="collapse"
          in={collapsed === false}
          timeout={timeout}
          mounOnEnter={true}
          unmountOnExit={true}
          enter={true}
          exit={true}
        >
          <CollapseContainer>
            <CollapseContainerInner>
              <TextAreaMultilocWithLocaleSwitcher
                label={<FormattedMessage {...messages.descriptionLabel} />}
                valueMultiloc={descriptionMultiloc}
                onChange={handleOnChange}
                rows={3}
              />
            </CollapseContainerInner>
          </CollapseContainer>
        </CSSTransition>
      </Container>
    );
  }

  return null;
});

export default IdeaCustomField;
