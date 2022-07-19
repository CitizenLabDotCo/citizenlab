# frozen_string_literal: true

class RemoveCustomizableHomepageBannerEnabledFromHomePages < ActiveRecord::Migration[6.1]
  def change
    remove_column :home_pages, :customizable_homepage_banner_enabled, :boolean, default: true, null: false
  end
end
