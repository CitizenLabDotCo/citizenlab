# frozen_string_literal: true

module IdeaAssignment
  module Extensions
    module IdeasFinder
      def assignee_condition(assignee_id)
        assignee_id = nil if assignee_id == 'unassigned'
        where(assignee_id: assignee_id)
      end
    end
  end
end
