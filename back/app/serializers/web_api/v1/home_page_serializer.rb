# frozen_string_literal: true

class WebApi::V1::HomePageSerializer < WebApi::V1::BaseSerializer
  attributes :top_info_section_enabled,
    :top_info_section_multiloc,
    :bottom_info_section_enabled,
    :events_widget_enabled,
    :projects_enabled,
    :projects_header_multiloc,
    :banner_avatars_enabled,
    :banner_layout,
    :banner_signed_in_header_multiloc,
    :banner_cta_signed_in_text_multiloc,
    :banner_cta_signed_in_type,
    :banner_cta_signed_in_url,
    :banner_signed_out_header_multiloc,
    :banner_signed_out_subheader_multiloc,
    :banner_signed_out_header_overlay_color,
    :banner_signed_out_header_overlay_opacity,
    :banner_cta_signed_out_text_multiloc,
    :banner_cta_signed_out_type,
    :banner_cta_signed_out_url,
    :pinned_admin_publication_ids

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :top_info_section_multiloc, if: proc { |object, _|
    object.top_info_section_multiloc.present?
  } do |object|
    TextImageService.new.render_data_images_multiloc object.top_info_section_multiloc, field: :top_info_section_multiloc, imageable: object
  end

  attribute :bottom_info_section_multiloc, if: proc { |object, _|
    object.bottom_info_section_multiloc.present?
  } do |object|
    TextImageService.new.render_data_images_multiloc object.bottom_info_section_multiloc, field: :bottom_info_section_multiloc, imageable: object
  end

  attribute :craftjs_json, if: proc { |object, params|
    AppConfiguration.instance.feature_activated? 'homepage_builder'
  } do |homepage|
    # TODO: move to layout
    ContentBuilder::LayoutImageService.new.render_data_images homepage.craftjs_json
  end

  has_many :pinned_admin_publications, serializer: :admin_publication
end
