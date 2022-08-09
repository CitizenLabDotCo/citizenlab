# frozen_string_literal: true

class CreateCustomPages < ActiveRecord::Migration[6.1]
  def change
    create_table :custom_pages, id: :uuid do |t|
      t.jsonb :title_multiloc, default: {}, null: false
      t.string :slug, index: true, unique: true

      t.boolean :banner_enabled, default: true, null: false
      t.string :banner_layout, default: 'full_width_banner_layout', null: false
      t.string :banner_overlay_color
      t.integer :banner_overlay_opacity
      t.jsonb :banner_cta_button_multiloc, default: {}, null: false
      t.string :banner_cta_button_type, default: 'no_button', null: false
      t.string :banner_cta_button_url
      t.jsonb :banner_header_multiloc, default: {}, null: false
      t.jsonb :banner_subheader_multiloc, default: {}, null: false

      t.boolean :top_info_section_enabled, default: false, null: false
      t.jsonb :top_info_section_multiloc, default: {}, null: false

      t.boolean :projects_enabled, default: false, null: false
      t.string :projects_filter_type

      t.boolean :events_widget_enabled, default: false, null: false

      t.boolean :bottom_info_section_enabled, default: false, null: false
      t.jsonb :bottom_info_section_multiloc, default: {}, null: false

      t.string :header_bg

      t.timestamps
    end
  end
end
