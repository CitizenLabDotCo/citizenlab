# frozen_string_literal: true

module ProjectManagement
  module Patches
    module Notifications
      module ProjectPhaseUpcoming
        def self.prepended(base)
          base.singleton_class.prepend(ClassMethods)
        end

        module ClassMethods
          def recipients(project_id)
            super.or(::User.project_moderator(project_id))
          end
        end
      end
    end
  end
end
