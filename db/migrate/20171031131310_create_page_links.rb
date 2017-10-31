class CreatePageLinks < ActiveRecord::Migration[5.1]
  def change
    create_table :page_links, :force => true, id: :uuid do |t|
      t.integer :linking_page_id, :null => false
      t.integer :linked_page_id, :null => false
      t.integer :order
    end
  end
end
