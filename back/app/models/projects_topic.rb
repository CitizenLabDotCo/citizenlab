# == Schema Information
#
# Table name: projects_topics
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
#  index_projects_topics_on_project_id  (project_id)
#  index_projects_topics_on_topic_id    (topic_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#  fk_rails_...  (topic_id => topics.id)
#
class ProjectsTopic < ApplicationRecord
  acts_as_list column: :ordering, scope: [:project_id], top_of_list: 0, add_new_at: :top
  
  belongs_to :project
  belongs_to :topic

  validates :project, :topic, presence: true

end
