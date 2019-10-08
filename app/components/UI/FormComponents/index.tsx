import React, { memo } from 'react';

import styled, { withTheme } from 'styled-components';
import { fontSizes, colors, booleanClass, invisibleA11yText, media } from 'utils/styleUtils';
import { FormattedMessage, IMessageInfo } from 'utils/cl-intl';
// tslint:disable-next-line:no-vanilla-formatted-messages
import { Messages, FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import Button from '../Button';
import messages from './messages';
import ContentContainer from 'components/ContentContainer';

export const FormSection = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 50px 40px 30px;
  color: ${({ theme }) => theme.colorText};
  margin-bottom: 10px;
  max-width: 620px;
  min-width: 560px;
  ${media.smallerThanMaxTablet`
    min-width: unset;
  `}
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.05);
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

export const FormLabelStyled: any = styled.label`
  font-size: ${fontSizes.base}px;
  color: ${({ theme }) => theme.colorText};
  font-weight: ${(props) => (props as any).thin ? 400 : 600};
  line-height: 21px;

  &.invisible {
    ${invisibleA11yText}
  }
`;

export const FormSubtextStyled = styled.span`
  font-size: ${fontSizes.small}px;
  color: ${colors.label};
  font-weight: 400;
`;

export const Spacer = styled.div`
  height: 12px;
`;

const OptionalText: any = styled.span`
  font-weight: ${(props) => (props as any).thin ? 300 : 400};
`;

interface FormLabelGenericProps {
  id?: string;
  htmlFor?: string;
  children?: any;
  hidden?: boolean;
  className?: string;
  thin?: boolean;
  noSpace?: boolean;
  optional?: boolean;
}

export interface FormLabelProps extends FormLabelGenericProps {
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
  noSpace,
  optional,
}: FormLabelProps) => (
  <FormLabelStyled thin={thin} id={id} className={`${booleanClass(className, className)}${booleanClass(hidden, 'invisible')}`} htmlFor={htmlFor}>
    <FormattedMessage {...labelMessage} values={labelMessageValues} />
    {optional &&
      <OptionalText thin={thin}>
        {' ('}
        <FormattedMessage {...messages.optional} />
        {')'}
      </OptionalText>
    }
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
  noSpace,
  optional
}: FormLabelValueProps) => (
  <FormLabelStyled thin={thin} id={id} className={`${booleanClass(className, className)}${booleanClass(hidden, 'invisible')}`} htmlFor={htmlFor}>
    {labelValue}
    {optional &&
      <OptionalText thin={thin}>
        {' ('}
        <FormattedMessage {...messages.optional} />
        {')'}
      </OptionalText>
    }
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

interface FormSubmitFooterProps extends IMessageInfo {
  disabled?: boolean;
  processing?: boolean;
  onSubmit: () => void;
  theme: any;
  className?: string;
  error: boolean;
  errorMessage: IMessageInfo['message'];
}

const SubmitFooterContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: white;
  border-top: 1px solid #e8e8e8;
  z-index: 1;
  ${media.smallerThanMaxTablet`
    align-items: center;
  `}
`;
const StyledContentContainer = styled(ContentContainer)`
  ${media.smallerThanMaxTablet`
    max-width: 620px;
  `}
`;

const SubmitFooterInner = styled.div`
  width: 100%;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  padding-bottom: 12px;
  background: #fff;

  ${media.smallerThanMinTablet`
    padding: 10px;
  `}
`;

export const FormSubmitFooter = withTheme(memo(({
  message,
  values,
  theme,
  onSubmit,
  className,
  error,
  errorMessage,
  ...otherProps
}: FormSubmitFooterProps) => (
  <SubmitFooterContainer className={className}>
    <StyledContentContainer mode="page">
      <SubmitFooterInner>
          <Button
            fontWeight="500"
            padding="13px 22px"
            bgColor={theme.colorMain}
            textColor="#FFF"
            type="submit"
            onClick={onSubmit}
            className="e2e-submit-form"
            {...otherProps}
          >
            <FormattedMessage {...message} values={values} />
          </Button>
          {error && <ErrorContainer className="e2e-error-form">
            <FormattedMessage {...errorMessage} />
          </ErrorContainer>}
      </SubmitFooterInner>
    </StyledContentContainer>
  </SubmitFooterContainer>
)));

const ErrorContainer = styled.div`
  color: ${colors.clRedError};
`;

export const FormError = memo(({
  message
}: IMessageInfo) => (
  <ErrorContainer className="e2e-error-form">
    <FormattedMessage {...message} />
  </ErrorContainer>
));
