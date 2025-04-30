class AddUserFieldsInFormToPhase < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :user_fields_in_form, :boolean, default: false, null: false
  end
end
