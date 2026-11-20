# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class StaticPages < Base
      def run
        layout_service = ContentBuilder::CustomPageLayoutService.new

        8.times do
          page = StaticPage.create!(title_multiloc: runner.create_for_some_locales { Faker::Lorem.sentence })
          ContentBuilder::Layout.create!(
            content_buildable: page,
            code: ContentBuilder::CustomPageLayoutService::CODE,
            enabled: true,
            craftjs_json: layout_service.craftjs_json_for_body(runner.rand_description_multiloc)
          )
        end
      end
    end
  end
end
