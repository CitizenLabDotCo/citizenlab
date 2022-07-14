# frozen_string_literal: true

class WebApi::V1::HomePageSerializer < WebApi::V1::BaseSerializer
  attributes :top_info_section_enabled,
    :top_info_section_multiloc,
    :bottom_info_section_enabled,
    :bottom_info_section_multiloc,
    :events_widget_enabled,
    :projects_enabled,
    :projects_header_multiloc,
    :banner_avatars_enabled,
    :customizable_homepage_banner_enabled,
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
    :header_bg,
    :pinned_admin_publication_ids

  has_many :pinned_admin_publications
end
