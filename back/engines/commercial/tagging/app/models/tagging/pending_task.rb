module Tagging
  class PendingTask < ApplicationRecord
    has_and_belongs_to_many :tags
    has_and_belongs_to_many :ideas, join_table: :tagging_pending_tasks_ideas 
    validates :nlp_task_id, presence: true
  end
end
