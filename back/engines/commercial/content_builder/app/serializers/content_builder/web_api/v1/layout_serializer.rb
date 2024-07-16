# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      class LayoutSerializer < ::WebApi::V1::BaseSerializer
        set_type :content_builder_layout
        attributes :enabled, :code, :created_at, :updated_at

        attribute :craftjs_json do |layout|
          LayoutImageService.new.render_data_images layout.craftjs_json
        end
      end
    end
  end
end
