# frozen_string_literal: true

require 'citizen_lab/permissions/scope_types/mixins/participation_context'

module CitizenLab
  module Permissions
    module ScopeTypes
      module Project
        extend Mixins::ParticipationContext

        def self.scope_type
          'Project'
        end

        def self.scope_class
          scope_type.constantize
        end
      end
    end
  end
end
