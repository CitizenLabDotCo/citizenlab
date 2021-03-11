# frozen_string_literal: true

module CitizenLab
  module Permissions
    module ScopeTypes
      module Mixins
        module ParticipationContext
          ACTIONS = {
            'information' => [],
            'ideation' => %w[posting_idea voting_idea commenting_idea],
            'survey' => %w[taking_survey],
            'poll' => %w[taking_poll],
            'budgeting' => %w[commenting_idea budgeting],
            'volunteering' => []
          }.freeze

          # @param [Project, Phase] scope
          def actions(scope = nil)
            return ACTIONS.values.flatten unless scope
            return [] unless scope.participation_context?

            ACTIONS[scope.participation_method]
          end
        end
      end
    end
  end
end
