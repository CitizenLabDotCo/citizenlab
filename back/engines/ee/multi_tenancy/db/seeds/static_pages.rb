# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class StaticPages < Base
      def run
        8.times do
          StaticPage.create!({
            title_multiloc: runner.create_for_some_locales { Faker::Lorem.sentence },
            top_info_section_multiloc: runner.create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
            top_info_section_enabled: true,
            files_section_enabled: true
          })
        end
      end
    end
  end
end
