import {
  UISchemaElement,
  Layout,
  Rule,
  Condition,
  RuleEffect,
  SchemaBasedCondition,
} from '@jsonforms/core';
import { ErrorObject } from 'ajv';
import { Multiloc } from 'component-library/utils/typings';

import { MessageDescriptor } from 'utils/cl-intl';

export type AjvErrorGetter = (
  error: ErrorObject,
  uischema?: UISchemaElement
) => MessageDescriptor | undefined;

export type ApiErrorGetter = (
  errorKey: string,
  fieldName: string
) => MessageDescriptor | undefined;

export interface PageType extends Layout {
  type: 'Page';
  options: {
    id?: string;
    title?: string;
    description?: string;
    map_config_id?: string;
    page_layout?: 'map' | 'default' | null;
    page_button_link?: string;
    page_button_label_multiloc?: Multiloc;
  };
  label?: string;
  scope?: string;
  ruleArray?: ExtendedRule[];
  elements: ExtendedUISchema[];
}

export interface PageCategorization extends ExtendedUISchema {
  type: 'Categorization';
  /**
   * The label of this categorization.
   */
  label: string;
  /**
   * The child elements of this categorization which are either of type
   * {@link PageType}.
   */
  elements: PageType[];
}

interface ConditionWithPageId extends Condition, SchemaBasedCondition {
  pageId?: string;
}

export interface HidePageCondition extends ConditionWithPageId {
  type: 'HIDEPAGE';
}

export type ExtendedRule = {
  /**
   * The effect of the rule
   */
  effect: RuleEffect;
  /**
   * The condition of the rule that must evaluate to true in order
   * to trigger the effect.
   */
  condition: ConditionWithPageId;
} & Rule;

export type ExtendedUISchema = {
  ruleArray?: ExtendedRule[];
  label?: string;
  scope: string;
} & UISchemaElement;

export type FormValues = Record<string, any>;
