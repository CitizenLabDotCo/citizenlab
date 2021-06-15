# frozen_string_literal: true

module ProjectManagement
  module Patches
    module IdeaPolicy
      def high_privileges?
        super || (record.class != Class && user&.project_moderator?(record.project_id))
      end
    end
  end
end
