# frozen_string_literal: true

module ReportBuilder
  module Composition
    module Tools
      # Reading and changing the report itself.
      module LayoutTools
        DEFINITIONS = [
          {
            tool_spec: {
              name: 'get_layout',
              description: 'Show the report as it stands: an outline of every node in reading ' \
                           'order, and the raw graph. Call it when you need node ids to change ' \
                           'or reorder something you cannot remember writing.',
              input_schema: { json: { type: 'object', properties: {} } }
            }
          },
          {
            tool_spec: {
              name: 'patch_layout',
              description: 'Add, change or remove nodes in the report. Send ONLY the nodes you ' \
                           'are adding or changing, each in its full final form; never re-send a ' \
                           'node you did not touch. The patch is merged into the report and ' \
                           'validated, and nothing is kept if it does not validate. Build the ' \
                           'report over several patches rather than one big one.',
              input_schema: {
                json: {
                  type: 'object',
                  properties: {
                    nodes: {
                      type: 'object',
                      description: 'Map of node-id to that node\'s full final JSON, containing only ' \
                                   'the nodes you are adding or changing. New ids are 10 characters ' \
                                   'of [A-Za-z0-9_-]. The first patch must include ROOT.'
                    },
                    delete_node_ids: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Ids to remove. A node\'s subtree goes with it, so name only the ' \
                                   'top of what you want gone.'
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
