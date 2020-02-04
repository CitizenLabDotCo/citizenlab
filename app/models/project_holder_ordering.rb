class ProjectHolderOrdering < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :top

  belongs_to :project_holder, polymorphic: true

  validates :project_holder, presence: true
end
