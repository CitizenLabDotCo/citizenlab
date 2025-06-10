class AddJsonbIndexesToIdeas < ActiveRecord::Migration[7.1]
  def change
    add_index :ideas, :title_multiloc, using: :gin
    add_index :ideas, :body_multiloc, using: :gin
  end
end
