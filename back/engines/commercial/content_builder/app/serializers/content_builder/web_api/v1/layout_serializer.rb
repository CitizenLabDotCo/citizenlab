# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      class LayoutSerializer < ::WebApi::V1::BaseSerializer
        set_type :content_builder_layout
        attributes :enabled, :code, :created_at, :updated_at

        attribute :craftjs_jsonmultiloc do |layout|
          # TODO: clean up after fully migrated
          if layout.content_buildable_type == 'ReportBuilder::Report'
            OldLayoutImageService.new.render_data_images_multiloc layout.craftjs_jsonmultiloc
          else
            LayoutImageService.new.render_data_images layout.craftjs_json
          end
        end
      end
    end
  end
end
