# frozen_string_literal: true

class AddBannerImageEnabledToHomePages < ActiveRecord::Migration[6.1]
  def change
    add_column :home_pages, :signed_in_banner_image_enabled, :boolean, default: true, null: false
  end
end
