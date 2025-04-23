import styled from 'styled-components';

import { SectionField } from 'components/admin/Section';
import FileUploader from 'components/UI/FileUploader';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import MultipleSelect from 'components/UI/MultipleSelect';

export const StyledForm = styled.form<{ showStickySaveButton: boolean }>`
  width: 500px;
  // Needed to ensure an uploaded file (or whichever field is last) is visible
  padding-bottom: ${(props) => (props.showStickySaveButton ? '80px' : '0')};
`;

export const StyledInputMultiloc = styled(InputMultilocWithLocaleSwitcher)`
  width: 497px;
`;

export const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  margin-bottom: 40px;
`;

export const StyledFileUploader = styled(FileUploader)`
  width: 500px;
`;

export const StyledMultipleSelect = styled(MultipleSelect)`
  width: 500px;
`;
