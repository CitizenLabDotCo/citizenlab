# frozen_string_literal: true

module ProjectManagement
  module Patches
    module Notifications
      module MarkedAsSpam
        def self.prepended(base)
          base.singleton_class.prepend(ClassMethods)
        end

        module ClassMethods
          def recipient_ids(initiating_user_id = nil, project_id = nil)
            moderator_ids = project_id ? ::User.project_moderator(project_id).ids : []
            moderator_ids.delete(initiating_user_id) if initiating_user_id
            (super + moderator_ids).uniq
          end
        end
      end
    end
  end
end
