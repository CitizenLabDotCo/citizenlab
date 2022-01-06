class RenamePagesToStaticPages < ActiveRecord::Migration[6.1]
  def change
    rename_table :pages, :static_pages
    rename_table :page_files, :static_page_files

    rename_column :static_page_files, :page_id, :static_page_id
    rename_column :nav_bar_items, :page_id, :static_page_id

    ActiveRecord::Base.connection.execute "UPDATE text_images SET imageable_type = 'StaticPage' WHERE imageable_type = 'Page'"
  end
end
