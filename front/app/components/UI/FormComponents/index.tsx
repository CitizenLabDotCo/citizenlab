import React, { memo } from 'react';
import styled from 'styled-components';
import {
  fontSizes,
  colors,
  invisibleA11yText,
  media,
  defaultCardStyle,
  isRtl,
} from 'utils/styleUtils';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import messages from './messages';
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
} from '@citizenlab/cl2-component-library';
import { omit } from 'lodash-es';

export const FormSection = styled.div`
  max-width: 620px;
  min-width: 560px;
  padding: 40px 40px 30px;
  color: ${({ theme }) => theme.colors.tenantText};
  margin-bottom: 15px;
  ${defaultCardStyle};

  ${media.tablet`
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
  color: ${colors.textPrimary};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
`;

const StyledSpan = styled.span`
  margin-right: 3px;
`;

interface FormSectionTitleProps {
  message: MessageDescriptor;
  subtitleMessage?: MessageDescriptor;
}

export const FormSectionTitle = memo(
  ({ message, subtitleMessage }: FormSectionTitleProps) => (
    <TitleContainer>
      <FormSectionTitleStyled>
        <FormattedMessage {...message} />
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
  color: ${({ theme }) => theme.colors.tenantText};
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
  font-size: ${fontSizes.s}px;
  color: ${colors.textSecondary};
  font-weight: 300;
  line-height: normal;
  margin-top: 4px;
  margin-bottom: 4px;
`;

export const Spacer = styled.div`
  height: 8px;
`;

const OptionalText = styled.span`
  color: ${({ theme }) => theme.colors.tenantText};
  font-weight: 400;
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledIcon = styled(Icon)`
  margin-left: 10px;
`;
declare type iconAriaHiddenTrue = {
  iconAriaHidden?: true;
};
declare type iconAriaHiddenFalse = {
  iconAriaHidden: false;
  iconTitle: string | JSX.Element;
};
declare type iconAriaHiddenProps = iconAriaHiddenTrue | iconAriaHiddenFalse;

type FormattedMessageProps = React.ComponentProps<typeof FormattedMessage>;

interface FormLabelGenericProps {
  id?: string;
  htmlFor?: string;
  children?: any;
  hidden?: boolean;
  className?: string;
  noSpace?: boolean;
  optional?: boolean;
  iconName?: IconNames;
  subtextMessage?: MessageDescriptor;
  subtextMessageValues?: FormattedMessageProps['values'];
  subtextValue?: JSX.Element | string;
  subtextSupportsHtml?: boolean;
}

interface FormLabelPropsMessages extends FormLabelGenericProps {
  labelMessage: MessageDescriptor;
  labelMessageValues?: FormattedMessageProps['values'];
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
    BoxZIndexProps &
    iconAriaHiddenProps
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
        <StyledSpan>
          {propsHasValues(props) ? (
            props.labelValue
          ) : (
            <FormattedMessage
              {...props.labelMessage}
              values={props.labelMessageValues}
            />
          )}
        </StyledSpan>
        {optional && (
          <OptionalText>
            &nbsp;{'('}
            <FormattedMessage {...messages.optional} />
            {')'}
          </OptionalText>
        )}
        {iconName && (
          <StyledIcon
            name={iconName}
            ariaHidden={iconAriaHidden}
            title={!iconAriaHidden && (props as any)?.iconTitle}
          />
        )}
      </LabelContainer>
      {subtextValue ? (
        <FormSubtextStyled>
          {subtextSupportsHtml && isString(subtextValue) ? (
            <div dangerouslySetInnerHTML={{ __html: subtextValue || '' }} />
          ) : (
            subtextValue
          )}
        </FormSubtextStyled>
      ) : (
        subtextMessage && (
          <FormSubtextStyled>
            <FormattedMessage
              {...subtextMessage}
              values={subtextMessageValues}
            />
          </FormSubtextStyled>
        )
      )}
      {!noSpace && <Spacer />}
      {children}
    </FormLabelStyled>
  );
});
