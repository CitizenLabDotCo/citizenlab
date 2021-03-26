class SetChildrenAllowedToFalseInProjects < ActiveRecord::Migration[6.0]
  def up
    AdminPublication.where(publication_type: 'Project').update(children_allowed: false)
  end
end
