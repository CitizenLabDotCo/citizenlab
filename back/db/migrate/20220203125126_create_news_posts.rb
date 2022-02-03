class CreateNewsPosts < ActiveRecord::Migration[6.1]
  def change
    create_table :news_posts, id: :uuid do |t|
      t.jsonb :title_multiloc
      t.jsonb :body_multiloc
      t.string :slug

      t.timestamps
    end
  end
end
