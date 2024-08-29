class CreateCustomFieldOptionImages < ActiveRecord::Migration[7.0]
  def change
    create_table :custom_field_option_images, id: :uuid do |t|
      t.references :custom_field_option, foreign_key: true, type: :uuid, index: true
      t.string :image
      t.integer :ordering, default: 0 # Note as a one to one relationship initially this is not used, but needed to keep the same structure as other images
      t.timestamps
    end
  end
end
