class CreateCustomForm < ActiveRecord::Migration[6.0]
  def change
    create_table :custom_forms, id: :uuid do |t|
      t.timestamps
    end
  end
end
