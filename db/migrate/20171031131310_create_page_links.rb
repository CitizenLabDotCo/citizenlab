class CreatePageLinks < ActiveRecord::Migration[5.1]
  def change
    create_table :page_links, :force => true, id: :uuid do |t|
      t.references :linking_page, foreign_key: {to_table: :pages}, type: :uuid, index: true, null: false
      t.references :linked_page, foreign_key: {to_table: :pages}, type: :uuid, index: true, null: false
      t.integer :ordering
    end
  end
end
