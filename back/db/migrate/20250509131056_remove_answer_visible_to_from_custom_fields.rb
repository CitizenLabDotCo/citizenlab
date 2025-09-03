class RemoveAnswerVisibleToFromCustomFields < ActiveRecord::Migration[7.1]
  def change
    remove_column :custom_fields, :answer_visible_to, :string
  end
end
