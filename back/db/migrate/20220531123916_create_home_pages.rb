# frozen_string_literal: true

class CreateHomePages < ActiveRecord::Migration[6.1]
  def change
    create_table :home_pages, id: :uuid do |t|
      t.boolean :top_info_section_enabled, default: false, null: false
      t.jsonb :top_info_section_multiloc, default: {}, null: false

      t.boolean :bottom_info_section_enabled, default: false, null: false
      t.jsonb :bottom_info_section_multiloc, default: {}, null: false

      t.boolean :events_enabled, default: false, null: false

      t.boolean :projects_enabled, default: true, null: false
      t.jsonb :projects_header_multiloc, default: {}, null: false

      t.boolean :banner_avatars_enabled, default: true, null: false

      t.boolean :banner_enabled, default: true, null: false
      t.string :banner_layout, default: 'full_width_banner_layout', null: false
      t.jsonb :banner_signed_in_header_multiloc, default: {}, null: false
      t.jsonb :cta_signed_in_text_multiloc, default: {}, null: false
      t.string :cta_signed_in_type, default: 'no_button', null: false
      t.string :cta_signed_in_url
      t.jsonb :banner_signed_out_header_multiloc, default: {}, null: false
      t.jsonb :banner_signed_out_subheader_multiloc, default: {}, null: false
      t.string :banner_signed_out_header_overlay_color
      t.integer :banner_signed_out_header_overlay_opacity
      t.jsonb :cta_signed_out_text_multiloc, default: {}, null: false
      t.string :cta_signed_out_type, default: 'sign_up_button', null: false
      t.string :cta_signed_out_url

      t.timestamps
    end
  end
end
