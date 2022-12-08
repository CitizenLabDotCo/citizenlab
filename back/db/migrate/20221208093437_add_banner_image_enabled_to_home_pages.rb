# frozen_string_literal: true

class AddBannerImageEnabledToHomePages < ActiveRecord::Migration[6.1]
  def change
    add_column :home_pages, :banner_signed_in_image_enabled, :boolean, default: true, null: false
  end
end
