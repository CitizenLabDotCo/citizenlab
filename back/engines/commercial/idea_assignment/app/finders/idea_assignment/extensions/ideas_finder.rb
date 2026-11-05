# frozen_string_literal: true

module IdeaAssignment
  module Extensions
    module IdeasFinder
      def assignee_condition(assignee)
        assignee_ids = Array(assignee).map { |id| id == 'unassigned' ? nil : id }
        where(assignee_id: assignee_ids)
      end
    end
  end
end
