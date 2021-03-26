# frozen_string_literal: true

module ProjectPermissions
  module Patches
    module IdeaPolicy
      module Scope
        def resolve_for_visitor
          super.where(projects: { visible_to: 'public' })
        end
      end
    end
  end
end
