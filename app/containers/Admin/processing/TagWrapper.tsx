import React, { memo } from 'react';

// components
import { Tag } from 'cl2-component-library';

import useLocalize from 'hooks/useLocalize';
import useTag from 'hooks/useTag';
import messages from './messages';
import { FormattedMessage } from 'react-intl';

type TagProps = React.ComponentProps<typeof Tag>;

interface Props extends Omit<TagProps, 'text'> {
  tagId: string | null;
}

export default memo<Props>(({ tagId, ...tagProps }) => {
  const localize = useLocalize();

  if (tagId) {
    const { tag } = useTag(tagId);
    if (tag) {
      return (
        <Tag
          {...tagProps}
          key={tagId}
          text={localize(tag.attributes.title_multiloc)}
        />
      );
    }
  } else {
    return (
      <Tag
        {...tagProps}
        isAutoTag={true}
        key={Math.random()}
        text={<FormattedMessage {...messages.pendingTagText} />}
      />
    );
  }

  return null;
});
