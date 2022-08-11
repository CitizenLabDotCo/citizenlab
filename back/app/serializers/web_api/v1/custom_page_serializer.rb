# frozen_string_literal: true

class WebApi::V1::CustomPageSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc,
    :slug,
    :banner_enabled,
    :banner_layout,
    :banner_overlay_color,
    :banner_overlay_opacity,
    :banner_cta_button_type,
    :banner_cta_button_url,
    :banner_cta_button_multiloc,
    :banner_header_multiloc,
    :banner_subheader_multiloc,
    :top_info_section_enabled,
    :top_info_section_multiloc,
    :bottom_info_section_enabled,
    :bottom_info_section_multiloc,
    :events_widget_enabled,
    :projects_enabled,
    :projects_filter_type,
    :header_bg,
    :pinned_admin_publication_ids,
    :custom_page_file_ids

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :top_info_section_multiloc, if: proc { |object, _|
    object.top_info_section_multiloc.present?
  } do |object|
    TextImageService.new.render_data_images object, :top_info_section_multiloc
  end

  attribute :bottom_info_section_multiloc, if: proc { |object, _|
    object.bottom_info_section_multiloc.present?
  } do |object|
    TextImageService.new.render_data_images object, :bottom_info_section_multiloc
  end

  # This is used to keep supporting default titles for
  # custom NavBarItems that are different from the page
  # title. That way, the frontend can know what the title
  # will be when the page would be added to the navbar (and
  # show this in the list of items to add).
  # attribute :nav_bar_item_title_multiloc do |object|
  #   current_navbaritem_title = object.nav_bar_item&.title_multiloc_with_fallback
  #   current_navbaritem_title || NavBarItem.new(code: 'custom', static_page: object).title_multiloc_with_fallback
  # end

  # has_one :nav_bar_item

  has_many :pinned_admin_publications
end
