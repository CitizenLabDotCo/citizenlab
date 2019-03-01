class ProjectSortScore < ApplicationRecord
  belongs_to :project

  def readonly?
    true
  end
end