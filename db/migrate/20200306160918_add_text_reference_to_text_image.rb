class AddTextReferenceToTextImage < ActiveRecord::Migration[6.0]
  def change
    add_column :text_images, :text_reference, :string, null: true
    TextImage.all.each do |ti|
      ti.update_column :text_reference, SecureRandom.uuid
    end
    change_column :text_images, :text_reference, :string, null: false
  end
end
