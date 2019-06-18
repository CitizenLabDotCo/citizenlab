class CreateUnionPosts < ActiveRecord::Migration[5.2]
  def change
    create_view :union_posts
  end
end
