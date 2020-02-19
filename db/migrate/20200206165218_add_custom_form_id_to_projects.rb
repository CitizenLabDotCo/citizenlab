class AddCustomFormIdToProjects < ActiveRecord::Migration[6.0]
  def change
    change_table :projects do |t|
      t.references :custom_form, null: true, type: :uuid
    end
  end
end
