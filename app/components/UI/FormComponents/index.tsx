import React, { memo } from 'react';

import styled from 'styled-components';
import { fontSizes, colors, booleanClass, invisibleA11yText } from 'utils/styleUtils';
import { FormattedMessage, IMessageInfo } from 'utils/cl-intl';
// tslint:disable-next-line:no-vanilla-formatted-messages
import { Messages, FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import Icon, { IconNames } from 'components/UI/Icon';
import Button from '../Button';

export const FormSection = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 30px 40px;
  color: ${({ theme }) => theme.colorText};
  margin-bottom: 10px;
  max-width: 620px;
  min-width: 560px;
`;

const TitleContainer = styled.div`
  margin-bottom: 30px;
`;

const FormSectionTitleStyled = styled.h2`
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  line-height: 28px;
`;
const FormSectionSubtitleStyled = styled.p`
  font-size: ${fontSizes.large}px;
  font-weight: 400;
  color: ${colors.label};
  line-height: 21px;
`;

interface FormSectionTitleProps extends IMessageInfo {
  subtitleMessage?: Messages['key'];
}

export const FormSectionTitle = memo(({ message, values, subtitleMessage }: FormSectionTitleProps) => (
  <TitleContainer>
    <FormSectionTitleStyled>
      <FormattedMessage {...message} values={values} />
    </FormSectionTitleStyled>
    {subtitleMessage &&
      <FormSectionSubtitleStyled>
        <FormattedMessage {...subtitleMessage} />
      </FormSectionSubtitleStyled>
    }
  </TitleContainer>
));

const FormLabelStyled: any = styled.label`
  font-size: ${fontSizes.large}px;
  color: ${({ theme }) => theme.colorText};
  font-weight: ${(props) => (props as any).thin ? 400 : 600};
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

interface FormLabelGenericProps {
  id?: string;
  htmlFor?: string;
  children?: any;
  hidden?: boolean;
  className?: string;
  thin?: boolean;
  noSpace?: boolean;
}

interface FormLabelProps extends FormLabelGenericProps {
  labelMessage: Messages['key'];
  labelMessageValues?: OriginalFormattedMessage.Props['values'];
  subtextMessage?: Messages['key'];
  subtextMessageValues?: OriginalFormattedMessage.Props['values'];
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
  hidden,
  thin,
  noSpace
}: FormLabelProps) => (
  <FormLabelStyled thin={thin} id={id} className={`${booleanClass(className, className)}${booleanClass(hidden, 'invisible')}`} htmlFor={htmlFor}>
    <FormattedMessage {...labelMessage} values={labelMessageValues} />
    {subtextMessage &&
      <>
        <br/>
        <FormSubtextStyled>
            <FormattedMessage {...subtextMessage} values={subtextMessageValues} />
        </FormSubtextStyled>
      </>
    }
    {!noSpace && <Spacer />}
    {children}
  </FormLabelStyled>
));

interface FormLabelValueProps extends FormLabelGenericProps {
  labelValue: JSX.Element | string;
  subtextValue?: JSX.Element;
}

export const FormLabelValue = memo(({
  labelValue,
  subtextValue,
  id,
  htmlFor,
  className,
  hidden,
  thin,
  noSpace
}: FormLabelValueProps) => (
  <FormLabelStyled thin={thin} id={id} className={`${booleanClass(className, className)}${booleanClass(hidden, 'invisible')}`} htmlFor={htmlFor}>
    {labelValue}
    {subtextValue &&
      <>
        <br/>
        <FormSubtextStyled>
          {subtextValue}
        </FormSubtextStyled>
      </>
    }
    {!noSpace && <Spacer />}
  </FormLabelStyled>
));

interface FormLabelWithIconProps extends FormLabelProps {
  iconName: IconNames;
}

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-left: 10px;
`;

export const FormLabelWithIcon = memo(({
  labelMessage,
  labelMessageValues,
  subtextMessage,
  subtextMessageValues,
  id,
  htmlFor,
  children,
  className,
  hidden,
  thin,
  noSpace,
  iconName
}: FormLabelWithIconProps) => (
  <FormLabelStyled thin={thin} id={id} className={`${booleanClass(className, className)}${booleanClass(hidden, 'invisible')}`} htmlFor={htmlFor}>
    <LabelContainer>
      <FormattedMessage {...labelMessage} values={labelMessageValues} />
      <StyledIcon name={iconName} />
    </LabelContainer>
    {subtextMessage &&
      <>
        <br/>
        <FormSubtextStyled>
            <FormattedMessage {...subtextMessage} values={subtextMessageValues} />
        </FormSubtextStyled>
      </>
    }
    {!noSpace && <Spacer />}
    {children}
  </FormLabelStyled>
));

interface FormSubmitFooterProps extends IMessageInfo {
  disabled?: boolean;
  processing?: boolean;
}

const SubmitFooterContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
`;

export const FormSubmitFooter = memo(({
  message,
  values,
  ...otherProps
}: FormSubmitFooterProps) => (
  <SubmitFooterContainer>
    <Button
      {...otherProps}
    />
  </SubmitFooterContainer>
));
