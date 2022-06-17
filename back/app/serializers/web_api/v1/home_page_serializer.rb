# frozen_string_literal: true

class WebApi::V1::HomePageSerializer < WebApi::V1::BaseSerializer
  attributes :id, :top_info_section_enabled, :header_bg
end
