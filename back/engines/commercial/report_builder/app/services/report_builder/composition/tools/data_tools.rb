# frozen_string_literal: true

module ReportBuilder
  module Composition
    module Tools
      # Looking at the data before deciding what the report says.
      module DataTools
        DEFINITIONS = [
          {
            tool_spec: {
              name: 'run_reporting_sql_query',
              description: 'Run one read-only SELECT over the reporting views and see the rows. ' \
                           'Use it to find out what the data holds before deciding what to chart.',
              input_schema: {
                json: {
                  type: 'object',
                  properties: { query: { type: 'string', description: 'A single SELECT statement.' } },
                  required: ['query']
                }
              }
            }
          }
        ].freeze
      end
    end
  end
end
