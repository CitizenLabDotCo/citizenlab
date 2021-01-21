import React, { memo } from 'react';

// components
import { Spinner, Tag } from 'cl2-component-library';

import useLocalize from 'hooks/useLocalize';
import useTag from 'hooks/useTag';
import styled from 'styled-components';

type TagProps = React.ComponentProps<typeof Tag>;

interface Props extends Omit<TagProps, 'text'> {
  tagId: string | null;
}

const StyledSpinner = styled(Spinner)`
  display: inline-flex;
  width: auto;
  margin: 2px;
`;

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
    return <StyledSpinner color="#666" size="20px" />;
  }

  return null;
});
