class AddCreationSourceToGroups < ActiveRecord::Migration[7.0]
  def change
    add_column :groups, :creation_source, :string, default: 'user', null: false
  end
end
