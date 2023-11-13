# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      class LayoutSerializer < ::WebApi::V1::BaseSerializer
        set_type :content_builder_layout
        attributes :enabled, :code, :created_at, :updated_at

        # TODO: clean up after fully migrated
        attribute :craftjs_jsonmultiloc do |layout|
          OldLayoutImageService.new.render_data_images_multiloc layout.craftjs_jsonmultiloc
        end

        attribute :craftjs_json do |layout|
          LayoutImageService.new.render_data_images layout.craftjs_json
        end
      end
    end
  end
end
