# frozen_string_literal: true

class HomepageLayoutService
  def swap_data_images(homepage, field)
    content = homepage.send field

    headerbg_elt = ContentBuilder::LayoutService.new.select_craftjs_elements_for_type(content, 'HomepageBanner').first

    if headerbg_elt
      headerbg_elt.dig('props', 'homepageSettings', 'header_bg').transform_values! { nil }
    end

    content
  end

  def render_data_images(homepage, field)
    content = homepage.send field
    return content if content.nil?

    headerbg_elt = ContentBuilder::LayoutService.new.select_craftjs_elements_for_type(content, 'HomepageBanner').first

    if headerbg_elt && homepage.header_bg
      headerbg_elt.dig['props']['homepageSettings']['header_bg'] = homepage.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
    end

    content
  end
end
