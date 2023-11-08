# frozen_string_literal: true

class SideFxHomePageService
  def before_create(home_page, _user)
    home_page.craftjs_json = HomepageLayoutService.new.swap_data_images home_page, :craftjs_json
  end

  def before_update(home_page, _ = nil)
    if home_page.top_info_section_multiloc.present?
      home_page.top_info_section_multiloc = TextImageService.new.swap_data_images home_page, :top_info_section_multiloc
    end

    if home_page.bottom_info_section_multiloc.present?
      home_page.bottom_info_section_multiloc = TextImageService.new.swap_data_images home_page, :bottom_info_section_multiloc
    end

    home_page.craftjs_json = HomepageLayoutService.new.swap_data_images home_page, :craftjs_json
  end
end
