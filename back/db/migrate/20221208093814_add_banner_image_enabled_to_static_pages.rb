# frozen_string_literal: true

class AddBannerImageEnabledToStaticPages < ActiveRecord::Migration[6.1]
  def change
    add_column :static_pages, :banner_image_enabled, :boolean, default: true, null: false
  end
end
