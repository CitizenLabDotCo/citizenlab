module IdeaAssignment
  module Extensions
    module IdeasFinder
      def assignee_condition(assignee_id)
        where(assignee_id: assignee_id)
      end
    end
  end
end

IdeasFinder.include_if_ee('IdeaAssignment::Extensions::IdeasFinder')
