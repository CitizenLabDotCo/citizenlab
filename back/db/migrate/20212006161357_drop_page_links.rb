class DropPageLinks < ActiveRecord::Migration[6.1]
  def change
    drop_table :page_links do |t|
      t.references :linking_page_id, foreign_key: { to_table: :pages }, type: :uuid, null: false
      t.references :linked_page_id, foreign_key: { to_table: :pages }, type: :uuid, null: false
      t.integer :ordering
    end
  end
end
