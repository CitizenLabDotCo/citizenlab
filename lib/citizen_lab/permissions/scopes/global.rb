# frozen_string_literal: true

module CitizenLab
  module Permissions
    module Scopes
      module Global
        def self.actions(_scope)
          %w[posting_initiative voting_initiative commenting_initiative]
        end

        def self.scope_types
          [nil]
        end
      end
    end
  end
end
