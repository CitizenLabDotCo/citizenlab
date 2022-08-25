# frozen_string_literal: true

class SideFxHomePageService
  include SideFxHelper

  def before_update(home_page, _ = nil)
    if home_page.top_info_section_multiloc
      home_page.top_info_section_multiloc = TextImageService.new.swap_data_images home_page, :top_info_section_multiloc
    end

    return unless home_page.bottom_info_section_multiloc

    home_page.bottom_info_section_multiloc = TextImageService.new.swap_data_images home_page, :bottom_info_section_multiloc
  end
end
