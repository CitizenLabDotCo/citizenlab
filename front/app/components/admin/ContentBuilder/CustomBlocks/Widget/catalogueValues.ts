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
 * A generated chart renders `localize(config.title) || msg('title')`: its text lives
 * in the message catalogue, and config only overrides it. Showing just config would
 * put an empty "Chart title" box next to a chart that plainly has one, and the first
 * keystroke in that box would read as the admin writing the title from scratch.
 *
 * So a text setting whose name matches a catalogue key starts filled in with what the
 * block is rendering. Nothing is written to the node: an untouched field shows the
 * catalogue text and stays absent from the props, exactly as a schema default does.
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
