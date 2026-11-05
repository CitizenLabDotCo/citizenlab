class AddLiveAutoTopicsEnabledToProjects < ActiveRecord::Migration[7.2]
  def change
    add_column :projects, :live_auto_input_topics_enabled, :boolean, default: false, null: false
  end
end
