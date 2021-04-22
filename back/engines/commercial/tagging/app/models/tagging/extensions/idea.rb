module Tagging
  module Extensions
    module Idea
      def self.included(base)
        base.class_eval do
          has_many :tagging_taggings, dependent: :destroy, class_name: 'Tagging::Tagging'
          has_many :tagging_tags, through: :tagging_taggings
          has_and_belongs_to_many :tagging_pending_tasks, class_name: 'Tagging::PendingTask', join_table: :tagging_pending_tasks_ideas
        end
      end
    end
  end
end
