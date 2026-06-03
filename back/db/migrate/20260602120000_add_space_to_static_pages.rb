class AddSpaceToStaticPages < ActiveRecord::Migration[7.2]
  def change
    safety_assured do
      create_table :static_pages_spaces, id: :uuid do |t|
        t.references :static_page, type: :uuid, null: false, foreign_key: true, index: true
        t.references :space, type: :uuid, null: false, foreign_key: true, index: true
        t.timestamps
      end

      add_index :static_pages_spaces, %i[static_page_id space_id], unique: true
    end
  end
end
