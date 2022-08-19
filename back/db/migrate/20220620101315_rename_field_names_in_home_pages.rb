# frozen_string_literal: true

class RenameFieldNamesInHomePages < ActiveRecord::Migration[6.1]
  def change
    rename_column :home_pages, :events_enabled, :events_widget
    rename_column :home_pages, :banner_enabled, :customizable_homepage_banner
  end
end
