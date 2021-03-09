# frozen_string_literal: true

module CitizenLab
  module Permissions
    module ScopeTypes
      module Phase
        extend Mixins::ParticipationContext

        def self.scope_type
          'Phase'
        end

        def self.scope_class
          scope_type.constantize
        end
      end
    end
  end
end
