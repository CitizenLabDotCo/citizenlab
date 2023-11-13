# frozen_string_literal: true

class SideFxHomePageService
  def before_create(home_page, _user)
    # TODO: move to layout
    home_page.craftjs_json = ContentBuilder::LayoutImageService.new.swap_data_images home_page.craftjs_json
  end

  def before_update(home_page, _ = nil)
    if home_page.top_info_section_multiloc.present?
      home_page.top_info_section_multiloc = TextImageService.new.swap_data_images_multiloc home_page.top_info_section_multiloc, field: :top_info_section_multiloc, imageable: home_page
    end

    if home_page.bottom_info_section_multiloc.present?
      home_page.bottom_info_section_multiloc = TextImageService.new.swap_data_images_multiloc home_page.bottom_info_section_multiloc, field: :bottom_info_section_multiloc, imageable: home_page
    end

    # TODO: move to layout
    home_page.craftjs_json = ContentBuilder::LayoutImageService.new.swap_data_images home_page.craftjs_json
  end
end
