import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import useDetectedCategories from 'modules/commercial/insights/hooks/useInsightsDetectedCategories';
import PageWrapper from 'components/admin/PageWrapper';
import Tag from 'modules/commercial/insights/admin/components/Tag';
import { isNilOrError } from 'utils/helperUtils';

const Detect = ({ params: { viewId } }: WithRouterProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const detectedCategories = useDetectedCategories(viewId);

  if (isNilOrError(detectedCategories)) {
    return null;
  }

  const handleCategoryClick = (selectedName: string) => () => {
    if (selectedCategories.includes(selectedName)) {
      setSelectedCategories(
        selectedCategories.filter((name) => name !== selectedName)
      );
    } else {
      setSelectedCategories([...selectedCategories, selectedName]);
    }
  };

  return (
    <PageWrapper>
      {detectedCategories.names.map((name) => (
        <Tag
          label={name}
          variant={selectedCategories.includes(name) ? 'primary' : 'default'}
          key={name}
          size="large"
          onIconClick={handleCategoryClick(name)}
        />
      ))}
    </PageWrapper>
  );
};

export default withRouter(Detect);
