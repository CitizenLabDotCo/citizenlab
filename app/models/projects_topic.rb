class ProjectsTopic < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :top
  
  belongs_to :project
  belongs_to :topic

  validates :project, :topic, presence: true
end
