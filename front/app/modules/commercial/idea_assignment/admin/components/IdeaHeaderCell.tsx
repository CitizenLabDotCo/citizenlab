import React, { FC, useEffect } from 'react';

import { TableHeaderCellText } from 'components/admin/PostManager/components/PostTable';
import { FormattedMessage } from 'utils/cl-intl';
import { CellConfiguration, InsertConfigurationOptions } from 'typings';
import { IdeaHeaderCellComponentProps } from 'components/admin/PostManager/components/PostTable/IdeaHeaderRow';
import messages from 'components/admin/PostManager/messages';

type Props = {
  onData: (
    data: InsertConfigurationOptions<
      CellConfiguration<IdeaHeaderCellComponentProps>
    >
  ) => void;
};

const IdeaHeaderCell: FC<Props> = ({ onData }) => {
  useEffect(
    () =>
      onData({
        configuration: {
          name: 'assignee',
          cellProps: { width: 2 },
          Component: () => {
            return (
              <TableHeaderCellText>
                <FormattedMessage {...messages.assignee} />
              </TableHeaderCellText>
            );
          },
        },
        insertAfterName: 'title',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default IdeaHeaderCell;
