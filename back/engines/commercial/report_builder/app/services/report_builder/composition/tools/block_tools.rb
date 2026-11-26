# frozen_string_literal: true

module ReportBuilder
  module Composition
    module Tools
      # Writing a chart, and changing one already written.
      module BlockTools
        # The three parts of the Data tab, so a chart answers the questions an admin
        # asks of it in the order they ask them. Shared by both tools: an edit that
        # changes what is counted replaces the whole explanation, not one part.
        EXPLANATION_SCHEMA = {
          type: 'object',
          description: 'What this chart counts, for the admin checking whether it says what ' \
                       'they think it says. Write it in the words an admin sees in the ' \
                       'platform, never table or column names, and carry over the caveats ' \
                       'the reporting schema states for the data you read.',
          properties: {
            included: {
              type: 'string',
              description: 'One or two sentences on what is in the chart: the thing being ' \
                           'counted, the period it covers, and how it is grouped.'
            },
            calculation: {
              type: 'string',
              description: 'One or two sentences on how the number is arrived at: whether one ' \
                           'counted thing is a person or an action, how a period is bucketed, ' \
                           'and who or what is left out.'
            },
            caveat: {
              type: 'string',
              description: 'The one thing that would make an admin read this chart wrongly, in ' \
                           'a single sentence. Leave it out when there is nothing to single out.'
            }
          },
          required: %w[included calculation]
        }.freeze

        DEFINITIONS = [
          {
            tool_spec: {
              name: 'author_chart_block',
              description: 'Store one chart as a block and get back the blockId and version to ' \
                           'place in the layout. The source is compiled, typechecked against the ' \
                           'SDK, linted, and every query it runs is put through the reporting SQL ' \
                           'sandbox. Nothing is stored unless all of that passes; whatever failed ' \
                           'comes back with line numbers for you to fix.',
              input_schema: {
                json: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'Short name for the block, for admins.' },
                    source: {
                      type: 'string',
                      description: 'The complete TSX of the block. The queries it runs are read ' \
                                   'out of this source, so there is no separate sql argument.'
                    },
                    messages: {
                      type: 'object',
                      description: 'Every string the block displays, as locale to key to text: ' \
                                   '{"en":{"title":"Contributions per month"}}. One entry per ' \
                                   'platform locale, with the same keys in each.'
                    },
                    config_schema: {
                      type: 'object',
                      description: 'A JSON Schema object describing the settings an admin can ' \
                                   'change on this chart without editing code. Each property ' \
                                   'becomes a field in the report builder sidebar and reaches the ' \
                                   'block as config[key]. Send {"type":"object","properties":{}} ' \
                                   'when there is nothing worth exposing.',
                      properties: {
                        type: { type: 'string', enum: ['object'] },
                        properties: {
                          type: 'object',
                          description: 'Field name to JSON Schema. Each needs a type ' \
                                       '(string, number, integer or boolean) and a title. Add ' \
                                       'enum for a fixed set of strings, x-multiloc for a ' \
                                       'translated string, default for a starting value.'
                        },
                        required: { type: 'array', items: { type: 'string' } }
                      },
                      required: %w[type properties]
                    },
                    explanation: EXPLANATION_SCHEMA
                  },
                  required: %w[title source messages config_schema explanation]
                }
              }
            }
          },
          {
            tool_spec: {
              name: 'edit_source',
              description: 'Change one passage of a chart you already authored, and get a new ' \
                           'version of it. Use this rather than authoring the chart again: send ' \
                           'only the text that changes. The passage must appear exactly once in ' \
                           'the source, so include enough of its surroundings to name one place. ' \
                           'The new version has a new number, so repoint the node that places it.',
              input_schema: {
                json: {
                  type: 'object',
                  properties: {
                    block_id: { type: 'string', description: 'A chart you authored in this run.' },
                    find: {
                      type: 'string',
                      description: 'The exact text to replace, whitespace included.'
                    },
                    replace: { type: 'string', description: 'What to put in its place.' },
                    explanation: EXPLANATION_SCHEMA.merge(
                      description: "#{EXPLANATION_SCHEMA[:description]} Send it only when the " \
                                   'edit changes what the chart counts; leave it out and the ' \
                                   'one already stored is kept.'
                    )
                  },
                  required: %w[block_id find replace]
                }
              }
            }
          }
        ].freeze
      end
    end
  end
end
