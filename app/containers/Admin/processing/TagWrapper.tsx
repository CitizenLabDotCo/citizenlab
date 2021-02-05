import React, { memo } from 'react';

// components
import { Tag } from 'cl2-component-library';

import useLocalize from 'hooks/useLocalize';
import useTag from 'hooks/useTag';

type TagProps = React.ComponentProps<typeof Tag>;

interface Props extends Omit<TagProps, 'text'> {
  tagId: string;
}

export default memo<Props>(({ tagId, ...tagProps }) => {
  const localize = useLocalize();

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

  return null;
});
