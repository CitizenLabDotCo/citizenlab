# This migration comes from smart_groups (originally 20240328133926)
class AddCreationSourceToGroups < ActiveRecord::Migration[7.0]
  def change
    add_column :groups, :creation_source, :string, default: 'user', null: false
  end
end
