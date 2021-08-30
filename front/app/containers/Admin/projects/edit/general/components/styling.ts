// components
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { Input } from 'cl2-component-library';
import MultipleSelect from 'components/UI/MultipleSelect';
import FileUploader from 'components/UI/FileUploader';
import { SectionField } from 'components/admin/Section';
import Warning from 'components/UI/Warning';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// other
import { timeout } from '..';

export const StyledForm = styled.form`
  width: 500px;
`;

export const StyledInputMultiloc = styled(InputMultilocWithLocaleSwitcher)`
  width: 497px;
`;

export const ProjectType = styled.div`
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 400;

  &:first-letter {
    text-transform: uppercase;
  }
`;

export const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  margin-bottom: 40px;
`;

export const ParticipationContextWrapper = styled.div`
  width: 497px;
  position: relative;
  padding: 30px;
  padding-bottom: 15px;
  margin-top: 8px;
  display: inline-block;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ddd;
  background: #fff;
  transition: opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  ::before,
  ::after {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  ::after {
    top: -20px;
    left: 25px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: 24px;
    border-color: transparent transparent #ddd transparent;
    border-width: 11px;
  }

  &.participationcontext-enter {
    opacity: 0;

    &.participationcontext-enter-active {
      opacity: 1;
    }
  }

  &.participationcontext-exit {
    opacity: 1;

    &.participationcontext-exit-active {
      opacity: 0;
    }
  }
`;

export const StyledFileUploader = styled(FileUploader)`
  width: 500px;
`;

export const StyledMultipleSelect = styled(MultipleSelect)`
  width: 500px;
`;

export const StyledWarning = styled(Warning)`
  margin-bottom: 15px;
`;

export const StyledInput = styled(Input)`
  margin-bottom: 20px;
`;

export const SlugPreview = styled.div`
  margin-bottom: 20px;
  font-size: ${fontSizes.base}px;
`;
