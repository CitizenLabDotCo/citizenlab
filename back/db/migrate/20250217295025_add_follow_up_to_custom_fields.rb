class AddFollowUpToCustomFields < ActiveRecord::Migration[7.1]
  def change
    add_column :custom_fields, :ask_follow_up, :boolean, default: false, null: false
  end
end
