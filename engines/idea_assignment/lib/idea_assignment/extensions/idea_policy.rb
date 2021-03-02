module IdeaAssignment
  module Extensions
    module IdeaPolicy
      def self.included(base)
        base.class_eval do
          permit_attribute :assignee_id, if: :admin_or_project_moderator?
        end
      end
    end
  end
end

IdeaPolicy.include_if_ee('IdeaAssignment::Extensions::IdeaPolicy')
