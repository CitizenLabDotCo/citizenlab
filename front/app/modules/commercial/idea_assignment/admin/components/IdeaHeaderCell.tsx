import React, { useEffect } from 'react';

// components
import { Th } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'components/admin/PostManager/messages';

// typings
import { CellConfiguration, InsertConfigurationOptions } from 'typings';
import { IdeaHeaderCellComponentProps } from 'components/admin/PostManager/components/PostTable/header/IdeaHeaderRow';

type Props = {
  onData: (
    data: InsertConfigurationOptions<
      CellConfiguration<IdeaHeaderCellComponentProps>
    >
  ) => void;
};

const IdeaHeaderCell = ({ onData }: Props) => {
  useEffect(
    () =>
      onData({
        configuration: {
          name: 'assignee',
          cellProps: { width: 2 },
          Component: ({ width }) => {
            return (
              <Th width={width}>
                <FormattedMessage {...messages.assignee} />
              </Th>
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
