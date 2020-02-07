class AddPostFormIdToProjects < ActiveRecord::Migration[6.0]
  def change
    change_table :projects do |t|
      t.references :post_form, null: true, type: :uuid
    end
  end
end
