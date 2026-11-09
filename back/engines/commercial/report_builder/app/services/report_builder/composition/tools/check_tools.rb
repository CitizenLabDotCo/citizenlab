# frozen_string_literal: true

module ReportBuilder
  module Composition
    module Tools
      # Seeing what a real browser makes of a chart, or of the report.
      module CheckTools
        DEFINITIONS = [
          {
            tool_spec: {
              name: 'check',
              description: 'Render what you have written in a real browser and report back: ' \
                           'whether it mounted, whether its charts actually drew anything, ' \
                           'whether anything overflows the page. Check a chart after you author ' \
                           'it, and the whole report when you think it is finished. A block that ' \
                           'compiles can still draw an empty frame, and only this will tell you. ' \
                           'A failed check comes back with a screenshot. Only ask for one on a ' \
                           'passing check when you are choosing between two layouts; a picture ' \
                           'of a report you have just been told is fine costs thousands of tokens.',
              input_schema: {
                json: {
                  type: 'object',
                  properties: {
                    block_id: { type: 'string', description: 'A chart you authored, rendered on its own.' },
                    config: { type: 'object', description: 'Settings to render that chart with.' },
                    node_id: {
                      type: 'string',
                      description: 'A node in the report, rendered with everything inside it. ' \
                                   'Omit both block_id and node_id to check the whole report.'
                    },
                    include_screenshot: {
                      type: 'boolean',
                      description: 'Also return a picture of the result when every check passed.'
                    }
                  }
                }
              }
            }
          }
        ].freeze
      end
    end
  end
end
