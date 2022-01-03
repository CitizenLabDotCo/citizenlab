# == Schema Information
#
# Table name: tagging_pending_tasks
#
#  id          :uuid             not null, primary key
#  nlp_task_id :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
module Tagging
  class PendingTask < ApplicationRecord
    has_and_belongs_to_many :tags
    has_and_belongs_to_many :ideas, join_table: :tagging_pending_tasks_ideas 
    validates :nlp_task_id, presence: true
  end
end
