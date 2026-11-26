# frozen_string_literal: true

module ReportBuilder
  module Composition
    module Tools
      # The three parts of a chart's Data tab, so a chart answers the questions an
      # admin asks of it in the order they ask them.
      #
      # Shared by authoring and editing: an edit that changes what is counted
      # replaces the whole explanation rather than one part of it.
      module ExplanationSchema
        SCHEMA = {
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
                           'and who or what is left out. Say it the way you would to someone ' \
                           'who has never seen the query: no table or column names, no SQL.'
            },
            caveat: {
              type: 'string',
              description: 'The one thing that would make an admin read this chart wrongly, in ' \
                           'a single sentence. Leave it out when there is nothing to single out.'
            }
          },
          required: %w[included calculation]
        }.freeze
      end
    end
  end
end
