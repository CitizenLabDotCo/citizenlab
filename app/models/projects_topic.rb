class ProjectsTopic < ApplicationRecord
  acts_as_list column: :ordering, scope: [:project_id], top_of_list: 0, add_new_at: :top
  
  belongs_to :project
  belongs_to :topic

  validates :project, :topic, presence: true

  after_destroy :destroy_idea_topics


  private

  def destroy_idea_topics
    IdeasTopic.where(idea: self.project.ideas, topic: self.topic).each(&:destroy!)
  end
end
