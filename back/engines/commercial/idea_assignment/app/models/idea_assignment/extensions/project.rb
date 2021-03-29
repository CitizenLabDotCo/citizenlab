module IdeaAssignment
  module Extensions
    module Project
      def self.included(base)
        base.class_eval do
          belongs_to :default_assignee, class_name: 'User', optional: true
        end
      end
    end
  end
end
