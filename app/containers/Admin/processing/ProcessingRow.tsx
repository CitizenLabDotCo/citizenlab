import React, { memo, useMemo, useCallback, RefObject } from 'react';
import { omitBy, isNil, isEmpty } from 'lodash-es';

// components
import { Checkbox, Spinner, Tag } from 'cl2-component-library';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';

// typings
import { IIdeaData } from 'services/ideas';
import { Multiloc } from 'typings';

// hooks
import useLocalize from 'hooks/useLocalize';
import { ITagging } from 'services/taggings';
import TagWrapper from './TagWrapper';
import { trackEventByName } from 'utils/analytics';

const Container = styled.tr<{ bgColor: string }>`
  background: ${({ bgColor }) => bgColor};
  :hover {
    background-color: #ebedef;
  }
`;

const StyledCheckbox = styled(Checkbox)`
  margin-top: -4px;
`;
const StyledTagWrapper = styled(TagWrapper)`
  cursor: default;
  margin-right: 4px;
`;

const StyledSpinner = styled(Spinner)`
  display: inline-flex;
  width: auto;
  margin: 4px;
`;

const TagContainer = styled.td`
  display: flex;
  align-items: center;
`;

const ContentTitle = styled.div`
  display: inline-block;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  idea: IIdeaData;
  selected: boolean;
  highlighted: boolean;
  onSelect: (ideaId: string) => void;
  className?: string;
  openPreview: (id: string) => void;
  rowRef?: RefObject<any>;
  taggings: ITagging[];
  showTagColumn: boolean;
  processing: boolean;
}

const addTagMessage = <FormattedMessage {...messages.addTag} />;

const ProcessingRow = memo<Props & InjectedIntlProps>(
  ({
    idea,
    selected,
    onSelect,
    className,
    openPreview,
    highlighted,
    rowRef,
    taggings,
    showTagColumn,
    processing,
  }) => {
    const contentTitle = omitBy(
      idea.attributes.title_multiloc,
      (value) => isNil(value) || isEmpty(value)
    ) as Multiloc;

    const localize = useLocalize();

    const bgColor = () => {
      if (highlighted) return rgba(colors.adminTextColor, 0.3);
      else if (selected) return rgba(colors.adminTextColor, 0.1);
      return '#fff';
    };

    const handleOnChecked = useCallback(
      (_event: React.ChangeEvent | React.MouseEvent) => {
        _event.preventDefault();
        trackEventByName('Processing Table Row', {
          action: 'selected one row',
          context: `${showTagColumn ? 'filter view' : 'tagging view'}`,
        });
        onSelect(idea.id);
      },
      [onSelect]
    );

    const handleClick = useCallback(
      (_event: React.ChangeEvent | React.MouseEvent) => {
        _event.preventDefault();
        _event.stopPropagation();
        trackEventByName('Processing Table Row', {
          action: 'clicked on idea title',
        });
        openPreview(idea.id);
      },
      [openPreview]
    );

    const sortTagsByMethod = (taggingA: ITagging) => {
      switch (taggingA.attributes.assignment_method) {
        case 'automatic':
          return 1;
        case 'manual':
          return -1;
      }
    };

    const ideaTaggings = useMemo(() => {
      return taggings
        .filter((tagging) => tagging.attributes.idea_id === idea.id)
        .sort(sortTagsByMethod);
    }, [taggings, idea]);

    return (
      <Container
        className={className}
        bgColor={bgColor()}
        onClick={handleOnChecked}
        ref={rowRef}
        key={idea.id}
      >
        <td className="checkbox">
          <StyledCheckbox checked={selected} onChange={handleOnChecked} />
        </td>

        <td className="title">
          <ContentTitle onClick={handleClick}>
            {localize(contentTitle)}
          </ContentTitle>
        </td>
        {showTagColumn && ideaTaggings && (
          <TagContainer className="tags">
            {ideaTaggings.map((tagging) => (
              <StyledTagWrapper
                isAutoTag={tagging.attributes.assignment_method === 'automatic'}
                isSelected={selected}
                tagId={tagging.attributes.tag_id}
                key={tagging.attributes.tag_id}
              />
            ))}
            {processing && <StyledSpinner color="#666" size="20px" />}
            {highlighted && ideaTaggings.length === 0 && (
              <Tag
                isAutoTag={true}
                isSelected={selected}
                onTagClick={handleClick}
                icon={'plus-circle'}
                text={addTagMessage}
              />
            )}
          </TagContainer>
        )}
      </Container>
    );
  }
);

export default injectIntl(ProcessingRow);
