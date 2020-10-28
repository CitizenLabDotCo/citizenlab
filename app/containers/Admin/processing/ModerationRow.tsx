import React, { memo, useCallback } from 'react';
import { omitBy, isNil, isEmpty } from 'lodash-es';

// components
import ModerationContentCell from './ModerationContentCell';
import Checkbox from 'components/UI/Checkbox';

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
`;

const StyledCheckbox = styled(Checkbox)`
  margin-top: -4px;
`;

interface Props {
  idea: IIdeaData;
  selected: boolean;
  onSelect: (ideaId: string) => void;
  className?: string;
  openPreview: (id: string) => void;
}

const ModerationRow = memo<Props & InjectedIntlProps>(
  ({ idea, selected, onSelect, className, openPreview }) => {
    const contentTitle = omitBy(
      idea.attributes.title_multiloc,
      (value) => isNil(value) || isEmpty(value)
    ) as Multiloc;

    const bgColor = selected ? rgba(colors.adminTextColor, 0.1) : '#fff';

    const handleOnChecked = useCallback(
      (_event: React.ChangeEvent) => {
        onSelect(idea.id);
      },
      [onSelect]
    );

    return (
      <Container className={className} bgColor={bgColor}>
        <td className="checkbox">
          <StyledCheckbox checked={selected} onChange={handleOnChecked} />
        </td>
        <td className="title" onClick={() => openPreview(idea.id)}>
          <ModerationContentCell contentTitle={contentTitle} />
        </td>
        <td className="content">tags tags tags</td>
      </Container>
    );
  }
);

export default injectIntl(ModerationRow);
