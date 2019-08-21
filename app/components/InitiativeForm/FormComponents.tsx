import styled from 'styled-components';
import { fontSizes, colors, booleanClass, invisibleA11yText } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
// tslint:disable-next-line:no-vanilla-formatted-messages
import { Messages, FormattedMessage as OriginalFormattedMessage } from 'react-intl';

import React, { memo } from 'react';

export const FormSection = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 30px 40px;
  color: ${({ theme }) => theme.colorText};
  margin-bottom: 10px;
`;

const FormSectionTitleStyled = styled.h2`
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  line-height: 28px;
  margin-bottom: 30px;
`;

interface FormSectionTitleProps {
  message: Messages['key'];
  values?: OriginalFormattedMessage.Props['values'];
}

export const FormSectionTitle = memo(({ message, values }: FormSectionTitleProps) => (
  <FormSectionTitleStyled>
    <FormattedMessage {...message} values={values} />
  </FormSectionTitleStyled>
));

const FormLabelStyled = styled.label`
  font-size: ${fontSizes.large}px;
  font-weight: 600;
  line-height: 21px;

  &.invisible {
    ${invisibleA11yText}
  }
`;
const FormSubtextStyled = styled.span`
  font-size: ${fontSizes.base}px;
  color: ${colors.label};
  font-weight: 300;
`;

const Spacer = styled.div`
  height: 12px;
`;

interface FormLabelProps {
  labelMessage: Messages['key'];
  labelMessageValues?: OriginalFormattedMessage.Props['values'];
  subtextMessage?: Messages['key'];
  subtextMessageValues?: OriginalFormattedMessage.Props['values'];
  id?: string;
  htmlFor?: string;
  children?: any;
  hidden?: boolean;
  className?: string;
}

export const FormLabel = memo(({
  labelMessage,
  labelMessageValues,
  subtextMessage,
  subtextMessageValues,
  id,
  htmlFor,
  children,
  className,
  hidden
}: FormLabelProps) => (
  <FormLabelStyled id={id} className={`${booleanClass(className, className)}${booleanClass(hidden, 'invisible')}`} htmlFor={htmlFor}>
    <FormattedMessage {...labelMessage} values={labelMessageValues} />
    {subtextMessage &&
      <>
        <br/>
        <FormSubtextStyled>
            <FormattedMessage {...subtextMessage} values={subtextMessageValues} />
        </FormSubtextStyled>
      </>
    }
    <Spacer />
    {children}
  </FormLabelStyled>
));
