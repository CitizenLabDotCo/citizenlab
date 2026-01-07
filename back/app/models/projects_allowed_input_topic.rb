# frozen_string_literal: true

# == Schema Information
#
# Table name: projects_allowed_input_topics
#
#  id         :uuid             not null, primary key
#  project_id :uuid
#  topic_id   :uuid
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  ordering   :integer
#
# Indexes
#
#  index_projects_allowed_input_topics_on_project_id               (project_id)
#  index_projects_allowed_input_topics_on_topic_id_and_project_id  (topic_id,project_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#  fk_rails_...  (topic_id => global_topics.id)
#
class ProjectsAllowedInputTopic < ApplicationRecord
  acts_as_list column: :ordering, scope: [:project_id], top_of_list: 0, add_new_at: :top

  belongs_to :project
  # NOTE: column is still topic_id but references GlobalTopic (renamed from Topic)
  belongs_to :topic, class_name: 'GlobalTopic', inverse_of: :projects_allowed_input_topics

  validates :project, :topic, presence: true
  validates :topic_id, uniqueness: { scope: :project_id }
end
