# frozen_string_literal: true

# == Schema Information
#
# Table name: projects_global_topics
#
#  id              :uuid             not null, primary key
#  global_topic_id :uuid             not null
#  project_id      :uuid             not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_projects_global_topics_on_project_id       (project_id)
#  index_projects_global_topics_on_global_topic_id  (global_topic_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#  fk_rails_...  (global_topic_id => global_topics.id)
#
class ProjectsGlobalTopic < ApplicationRecord
  belongs_to :project
  belongs_to :global_topic
end
