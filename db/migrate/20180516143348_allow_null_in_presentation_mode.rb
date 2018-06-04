class AllowNullInPresentationMode < ActiveRecord::Migration[5.1]
  def change
  	change_column :phases, :presentation_mode, :string, null: true
  	change_column :projects, :presentation_mode, :string, null: true
  end
end
