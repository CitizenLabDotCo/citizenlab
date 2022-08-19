import React from 'react';
// import { useTheme } from 'styled-components';

// components
import CreateHookForm, { CreateCustomPageFormValues } from './CreateHookForm';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// constants

// utils
import { isNilOrError } from 'utils/helperUtils';

export const SlugPreview = styled.div`
  margin-bottom: 20px;
  font-size: ${fontSizes.base}px;
`;

const CreateCustomPage = () => {
  const appConfig = useAppConfiguration();
 
  if (isNilOrError(appConfig)) return null;
  const handleSubmit = async (values: CreateCustomPageFormValues) => {
    console.log(values);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };
  return (
   <>
     <CreateHookForm onSubmit={handleSubmit}/>
   </>
  );
};

export default injectIntl(CreateCustomPage);
