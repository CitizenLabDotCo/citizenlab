class AddOrderingToProjects < ActiveRecord::Migration[5.1]
  def change
  	add_column :projects, :ordering, :integer

    order = 0
  	Project.order(created_at: :asc).each do |p|
  		p.ordering = order
  		p.save!
  		order += 1
  	end
  end
end
