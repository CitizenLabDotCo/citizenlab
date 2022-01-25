import React, { memo } from 'react';
import styled, { withTheme } from 'styled-components';
import {
  fontSizes,
  colors,
  invisibleA11yText,
  media,
  defaultCardStyle,
  isRtl,
} from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, IMessageInfo } from 'utils/cl-intl';
// tslint:disable-next-line:no-vanilla-formatted-messages
import {
  Messages,
  FormattedMessage as OriginalFormattedMessage,
} from 'react-intl';
import Button from '../Button';
import messages from './messages';
import ContentContainer from 'components/ContentContainer';
import { isString } from 'utils/helperUtils';
import {
  Box,
  BoxBackgroundProps,
  BoxBorderProps,
  BoxColorProps,
  BoxDisplayProps,
  BoxFlexProps,
  BoxHeightProps,
  BoxMarginProps,
  BoxOverflowProps,
  BoxPaddingProps,
  BoxPositionProps,
  BoxVisibilityProps,
  BoxWidthProps,
  BoxZIndexProps,
  Icon,
  IconNames,
} from 'cl2-component-library';
import { omit } from 'lodash-es';

export const FormSection = styled.div`
  max-width: 620px;
  min-width: 560px;
  padding: 40px 40px 30px;
  color: ${({ theme }) => theme.colorText};
  margin-bottom: 15px;
  ${defaultCardStyle};

  ${media.smallerThanMaxTablet`
    min-width: auto;
  `}
`;

const TitleContainer = styled.div`
  margin-bottom: 30px;
`;

const FormSectionTitleStyled = styled.h2`
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  line-height: 28px;
`;

const FormSectionDescriptionStyled = styled.p`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
`;

const StyledButton = styled(Button)`
  margin-right: 10px;
`;

interface FormSectionTitleProps extends IMessageInfo {
  subtitleMessage?: Messages['key'];
}

export const FormSectionTitle = memo(
  ({ message, values, subtitleMessage }: FormSectionTitleProps) => (
    <TitleContainer>
      <FormSectionTitleStyled>
        <FormattedMessage {...message} values={values} />
      </FormSectionTitleStyled>
      {subtitleMessage && (
        <FormSectionDescriptionStyled>
          <FormattedMessage {...subtitleMessage} />
        </FormSectionDescriptionStyled>
      )}
    </TitleContainer>
  )
);

export const FormLabelStyled = styled(Box)`
  width: 100%;
  font-size: ${fontSizes.base}px;
  color: ${({ theme }) => theme.colorText};
  font-weight: 500;
  line-height: normal;

  &.invisible {
    ${invisibleA11yText}
  }

  ${isRtl`
    text-align: right;
`}
`;

export const FormSubtextStyled = styled.div`
  width: 100%;
  font-size: ${fontSizes.small}px;
  color: ${colors.label};
  font-weight: 300;
  line-height: normal;
  margin-top: 4px;
  margin-bottom: 4px;
`;

export const Spacer = styled.div`
  height: 8px;
`;

const OptionalText = styled.span`
  color: ${({ theme }) => theme.colorText};
  font-weight: 400;
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-left: 10px;
`;

interface FormLabelGenericProps {
  id?: string;
  htmlFor?: string;
  children?: any;
  hidden?: boolean;
  className?: string;
  noSpace?: boolean;
  optional?: boolean;
  iconName?: IconNames;
  iconAriaHidden?: boolean;
  subtextMessage?: Messages['key'];
  subtextMessageValues?: OriginalFormattedMessage.Props['values'];
  subtextValue?: JSX.Element | string;
  subtextSupportsHtml?: boolean;
}

interface FormLabelPropsMessages extends FormLabelGenericProps {
  labelMessage: Messages['key'];
  labelMessageValues?: OriginalFormattedMessage.Props['values'];
}

interface FormLabelPropsValue extends FormLabelGenericProps {
  labelValue: JSX.Element | string;
}

type FormLabelProps = FormLabelPropsMessages | FormLabelPropsValue;

function propsHasValues(props: FormLabelProps): props is FormLabelPropsValue {
  return (props as FormLabelPropsValue).labelValue !== undefined;
}

export const FormLabel = memo<
  FormLabelProps &
    BoxColorProps &
    BoxBackgroundProps &
    BoxPaddingProps &
    BoxMarginProps &
    BoxHeightProps &
    BoxWidthProps &
    BoxDisplayProps &
    BoxOverflowProps &
    BoxPositionProps &
    BoxFlexProps &
    BoxBorderProps &
    BoxVisibilityProps &
    BoxZIndexProps
>((props) => {
  const {
    id,
    htmlFor,
    children,
    className,
    hidden,
    noSpace,
    optional,
    iconName,
    iconAriaHidden,
    subtextMessage,
    subtextMessageValues,
    subtextSupportsHtml,
    subtextValue,
    ...remainingProps
  } = props;

  return (
    <FormLabelStyled
      id={id}
      as="label"
      className={[className, hidden ? 'invisible' : null]
        .filter((item) => item)
        .join(' ')}
      htmlFor={htmlFor}
      {...omit(remainingProps, [
        'labelMessage',
        'labelMessageValues',
        'labelValue',
      ])}
    >
      <LabelContainer>
        {propsHasValues(props) ? (
          props.labelValue
        ) : (
          <FormattedMessage
            {...props.labelMessage}
            values={props.labelMessageValues}
          />
        )}
        {optional && (
          <OptionalText>
            {' ('}
            <FormattedMessage {...messages.optional} />
            {')'}
          </OptionalText>
        )}
        {iconName && <StyledIcon name={iconName} ariaHidden={iconAriaHidden} />}
      </LabelContainer>
      {props.subtextValue ? (
        <FormSubtextStyled>
          {props.subtextSupportsHtml && isString(props.subtextValue) ? (
            <div
              dangerouslySetInnerHTML={{ __html: props.subtextValue || '' }}
            />
          ) : (
            props.subtextValue
          )}
        </FormSubtextStyled>
      ) : (
        props.subtextMessage && (
          <FormSubtextStyled>
            <FormattedMessage
              {...props.subtextMessage}
              values={props.subtextMessageValues}
            />
          </FormSubtextStyled>
        )
      )}
      {!noSpace && <Spacer />}
      {children}
    </FormLabelStyled>
  );
});

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
  border-bottom: 1px solid #e8e8e8;
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

export const FormSubmitFooter = withTheme(
  memo(
    ({
      message,
      values,
      theme,
      onSubmit,
      className,
      error,
      errorMessage,
      disabled,
      ...otherProps
    }: FormSubmitFooterProps) => (
      <SubmitFooterContainer className={className}>
        <StyledContentContainer mode="page">
          <SubmitFooterInner>
            <StyledButton
              fontWeight="500"
              padding="13px 22px"
              bgColor={theme.colorMain}
              textColor="#FFF"
              type="submit"
              onClick={onSubmit}
              className="e2e-submit-form"
              disabled={disabled}
              ariaDisabled={disabled}
              {...otherProps}
            >
              <FormattedMessage {...message} values={values} />
            </StyledButton>
            {error && (
              <ErrorContainer className="e2e-error-form">
                <FormattedMessage {...errorMessage} />
              </ErrorContainer>
            )}
            <ScreenReaderOnly aria-live="polite">
              {disabled ? (
                <FormattedMessage {...messages.buttonDisabled} />
              ) : (
                <FormattedMessage {...messages.buttonEnabled} />
              )}
            </ScreenReaderOnly>
          </SubmitFooterInner>
        </StyledContentContainer>
      </SubmitFooterContainer>
    )
  )
);

const ErrorContainer = styled.div`
  color: ${colors.clRedError};
`;
