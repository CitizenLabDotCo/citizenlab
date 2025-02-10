import {
  UISchemaElement,
  Layout,
  Rule,
  Condition,
  RuleEffect,
  SchemaBasedCondition,
  Scopable,
} from '@jsonforms/core';
import { ErrorObject } from 'ajv';

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

interface ConditionWithPageId
  extends Condition,
    Scopable,
    SchemaBasedCondition {
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
} & UISchemaElement &
  Scopable;

export type FormData = Record<string, any>;
