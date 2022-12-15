# frozen_string_literal: true

class AddFieldsAndRenameFieldInStaticPages < ActiveRecord::Migration[6.1]
  # rubocop:disable Rails/ApplicationRecord
  class StubStaticPage < ActiveRecord::Base
    self.table_name = 'static_pages'
  end
  # rubocop:enable Rails/ApplicationRecord

  def change
    reversible do |dir|
      dir.up do
        execute('UPDATE static_pages SET top_info_section_multiloc = body_multiloc')
      end
    end

    change_column_null :static_pages, :top_info_section_multiloc, false
    change_column_default :static_pages, :top_info_section_multiloc, from: nil, to: {}
    add_column :static_pages, :banner_enabled, :boolean, default: false, null: false
    add_column :static_pages, :banner_layout, :string, default: 'full_width_banner_layout', null: false
    add_column :static_pages, :banner_overlay_color, :string
    add_column :static_pages, :banner_overlay_opacity, :integer
    add_column :static_pages, :banner_cta_button_multiloc, :jsonb, default: {}, null: false
    add_column :static_pages, :banner_cta_button_type, :string, default: 'no_button', null: false
    add_column :static_pages, :banner_cta_button_url, :string
    add_column :static_pages, :banner_header_multiloc, :jsonb, default: {}, null: false
    add_column :static_pages, :banner_subheader_multiloc, :jsonb, default: {}, null: false
    add_column :static_pages, :top_info_section_enabled, :boolean, default: false, null: false
    add_column :static_pages, :files_section_enabled, :boolean, default: false, null: false
    add_column :static_pages, :projects_enabled, :boolean, default: false, null: false
    add_column :static_pages, :projects_filter_type, :string
    add_column :static_pages, :events_widget_enabled, :boolean, default: false, null: false
    add_column :static_pages, :bottom_info_section_enabled, :boolean, default: false, null: false
    add_column :static_pages, :bottom_info_section_multiloc, :jsonb, default: {}, null: false
    add_column :static_pages, :header_bg, :string

    reversible do |dir|
      dir.up do
        StubStaticPage.reset_column_information
        StubStaticPage.update_all(banner_enabled: false, top_info_section_enabled: true)
        StubStaticPage.where.not(code: %w[terms-and-conditions privacy-policy]).update_all(files_section_enabled: true)
      end
    end
  end
end
