# frozen_string_literal: true

class WebApi::V1::StaticPageSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc,
    :top_info_section_multiloc,
    :slug,
    :created_at,
    :updated_at,
    :code,
    :banner_enabled,
    :banner_layout,
    :banner_overlay_color,
    :banner_overlay_opacity,
    :banner_cta_button_multiloc,
    :banner_cta_button_type,
    :banner_cta_button_url,
    :banner_header_multiloc,
    :banner_subheader_multiloc,
    :top_info_section_enabled,
    :files_section_enabled,
    :projects_enabled,
    :projects_filter_type,
    :events_widget_enabled,
    :bottom_info_section_enabled,
    :bottom_info_section_multiloc,
    :header_bg

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

  # This is used to keep supporting default titles for
  # custom NavBarItems that are different from the page
  # title. That way, the frontend can know what the title
  # will be when the page would be added to the navbar (and
  # show this in the list of items to add).
  # See also back/app/controllers/web_api/v1/static_pages_controller.rb
  # #assign_attributes
  attribute :nav_bar_item_title_multiloc do |object|
    current_navbaritem_title = object.nav_bar_item&.title_multiloc_with_fallback
    current_navbaritem_title || NavBarItem.new(code: 'custom', static_page: object).title_multiloc_with_fallback
  end

  has_one :nav_bar_item
  has_many :static_page_files, serializer: :file
  has_many :text_images, serializer: :image
  has_many :global_topics, serializer: WebApi::V1::GlobalTopicSerializer
  has_many :areas
end
