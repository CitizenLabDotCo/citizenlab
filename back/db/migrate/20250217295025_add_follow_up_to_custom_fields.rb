class AddFollowUpToCustomFields < ActiveRecord::Migration[7.0]
  class StubCustomField < ApplicationRecord
    self.table_name = 'custom_fields'
  end

  def change
    add_column :custom_fields, :ask_follow_up, :boolean, default: false, null: false
  end
end
