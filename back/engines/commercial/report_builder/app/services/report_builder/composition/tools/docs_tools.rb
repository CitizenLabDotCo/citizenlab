# frozen_string_literal: true

module ReportBuilder
  module Composition
    module Tools
      # The longer notes, when the prompt is not enough.
      module DocsTools
        DEFINITIONS = [
          {
            tool_spec: {
              name: 'read_docs',
              description: 'Read the longer notes on one topic: worked chart forms, query patterns ' \
                           'over the reporting views, what config_schema can express, how the ' \
                           "layout widgets fit together. Topics: #{Docs.topics.join(', ')}. " \
                           'Read one before writing something the prompt has no example of.',
              input_schema: {
                json: {
                  type: 'object',
                  properties: {
                    topic: { type: 'string', enum: Docs.topics, description: 'Which notes to read.' }
                  },
                  required: ['topic']
                }
              }
            }
          }
        ].freeze
      end
    end
  end
end
