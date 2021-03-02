module IdeaAssignment
  module Extensions
    module User
      def self.included(base)
        base.class_eval do
          has_many :assigned_ideas, class_name: 'Idea', foreign_key: :assignee_id, dependent: :nullify
        end
      end
    end
  end
end

User.include_if_ee('IdeaAssignment::Extensions::User')
