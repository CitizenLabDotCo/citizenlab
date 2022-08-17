# frozen_string_literal: true

class RenameStaticPageIdToPageIdAndAddPageTypeAndUpdateDataInNavBarItems < ActiveRecord::Migration[6.1]
  # rubocop:disable Rails/ApplicationRecord
  class NavBarItem < ActiveRecord::Base
  end
  # rubocop:enable Rails/ApplicationRecord

  def change
    remove_foreign_key :nav_bar_items, :static_pages
    rename_column :nav_bar_items, :static_page_id, :page_id
    add_column :nav_bar_items, :page_type, :string

    reversible do |dir|
      dir.up do
        NavBarItem.reset_column_information
        NavBarItem.where.not(page_id: nil).update_all(page_type: 'StaticPage')
      end
    end
  end
end
