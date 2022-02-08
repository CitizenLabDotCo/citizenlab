# == Schema Information
#
# Table name: projects_topics
#
#  id         :uuid             not null, primary key
#  project_id :uuid             not null
#  topic_id   :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_projects_topics_on_project_id  (project_id)
#  index_projects_topics_on_topic_id    (topic_id)
#
class ProjectsTopic < ApplicationRecord
  belongs_to :project
  belongs_to :topic
end
