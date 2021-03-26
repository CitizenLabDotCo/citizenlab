module IdeaAssignment
  module Extensions
    module User
      def self.included(base)
        base.class_eval do
          has_many :assigned_ideas, class_name: 'Idea', foreign_key: :assignee_id, dependent: :nullify
          has_many :default_assigned_projects,
                   class_name: 'Project',
                   foreign_key: :default_assignee_id,
                   dependent: :nullify
        end
      end
    end
  end
end
