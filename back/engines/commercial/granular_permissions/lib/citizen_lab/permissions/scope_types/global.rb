# frozen_string_literal: true

module CitizenLab
  module Permissions
    module ScopeTypes
      module Global
        def self.actions(_scope = nil)
          %w[posting_initiative voting_initiative commenting_initiative]
        end

        def self.scope_type
          nil
        end

        def self.scope_class
          nil
        end
      end
    end
  end
end
