# frozen_string_literal: true

class RenameFieldsInHomePages < ActiveRecord::Migration[6.1]
  def change
    rename_column :home_pages, :events_widget, :events_widget_enabled
    rename_column :home_pages, :customizable_homepage_banner, :customizable_homepage_banner_enabled
    rename_column :home_pages, :cta_signed_in_text_multiloc, :banner_cta_signed_in_text_multiloc
    rename_column :home_pages, :cta_signed_in_type, :banner_cta_signed_in_type
    rename_column :home_pages, :cta_signed_in_url, :banner_cta_signed_in_url
    rename_column :home_pages, :cta_signed_out_text_multiloc, :banner_cta_signed_out_text_multiloc
    rename_column :home_pages, :cta_signed_out_type, :banner_cta_signed_out_type
    rename_column :home_pages, :cta_signed_out_url, :banner_cta_signed_out_url
  end
end
