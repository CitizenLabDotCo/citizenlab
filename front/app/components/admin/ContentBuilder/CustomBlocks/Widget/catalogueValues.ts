import { Multiloc } from 'typings';

import {
  BlockConfigValues,
  BlockMessages,
  ConfigSchema,
} from 'api/custom_blocks/types';

// locale -> key -> text, turned inside out: key -> multiloc.
const multilocsByKey = (messages: BlockMessages): Record<string, Multiloc> => {
  const byKey: Record<string, Multiloc> = {};

  Object.entries(messages).forEach(([locale, entries]) => {
    Object.entries(entries).forEach(([key, text]) => {
      byKey[key] = { ...byKey[key], [locale]: text };
    });
  });

  return byKey;
};

/**
 * The values to show in a block's settings, with the block's own text filled in.
 *
 * A chart renders `localize(config.title) || msg('title')`, so its text lives in the
 * catalogue and config only overrides it. Showing config alone would put an empty
 * "Chart title" box beside a chart that plainly has one. Nothing is written to the
 * node: an untouched field stays absent from the props, as a schema default does.
 */
const catalogueValues = (
  schema: ConfigSchema | undefined,
  messages: BlockMessages | undefined,
  config: BlockConfigValues
): BlockConfigValues => {
  if (!schema?.properties || !messages) return config;

  const fromCatalogue = multilocsByKey(messages);
  const filled: BlockConfigValues = {};

  Object.entries(schema.properties).forEach(([name, field]) => {
    if (field['x-multiloc'] && name in fromCatalogue) {
      filled[name] = fromCatalogue[name];
    }
  });

  // Anything the admin actually set wins over what the block ships with.
  return { ...filled, ...config };
};

export default catalogueValues;
