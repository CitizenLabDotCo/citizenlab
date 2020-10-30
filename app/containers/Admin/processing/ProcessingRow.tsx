import React, { memo, useCallback } from 'react';
import { omitBy, isNil, isEmpty } from 'lodash-es';

// components
import ProcessingTableCell from './ProcessingTableCell';
import { Checkbox, Tag } from 'cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { rgba } from 'polished';

// typings
import { IIdeaData } from 'services/ideas';
import { Multiloc } from 'typings';

const Container = styled.tr<{ bgColor: string }>`
  background: ${({ bgColor }) => bgColor};
  :hover {
    background-color: #ebedef;
  }
`;

const StyledCheckbox = styled(Checkbox)`
  margin-top: -4px;
`;

interface Props {
  idea: IIdeaData;
  selected: boolean;
  highlighted: boolean;
  onSelect: (ideaId: string) => void;
  className?: string;
  openPreview: (id: string) => void;
}

const ProcessingRow = memo<Props & InjectedIntlProps>(
  ({ idea, selected, onSelect, className, openPreview, highlighted }) => {
    const contentTitle = omitBy(
      idea.attributes.title_multiloc,
      (value) => isNil(value) || isEmpty(value)
    ) as Multiloc;

    const bgColor = highlighted
      ? rgba(colors.adminTextColor, 0.3)
      : selected
      ? rgba(colors.adminTextColor, 0.1)
      : '#fff';

    const handleOnChecked = useCallback(
      (_event: React.ChangeEvent | React.MouseEvent) => {
        _event.preventDefault();
        onSelect(idea.id);
      },
      [onSelect]
    );

    const handleClick = useCallback(() => openPreview(idea.id), [openPreview]);

    return (
      <Container
        className={className}
        bgColor={bgColor}
        onClick={handleOnChecked}
      >
        <td className="checkbox">
          <StyledCheckbox checked={selected} onChange={handleOnChecked} />
        </td>

        <td className="title">
          <ProcessingTableCell
            contentTitle={contentTitle}
            handleClick={handleClick}
          />
        </td>
        <td className="content">
          <Tag text={'tag'} isAutoTag={true} />
        </td>
      </Container>
    );
  }
);

export default injectIntl(ProcessingRow);
