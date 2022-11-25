# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Areas < Base
      def run
        12.times do
          Area.create!({
            title_multiloc: runner.create_for_tenant_locales { Faker::Address.city },
            description_multiloc: runner.create_for_tenant_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join }
          })
        end

        Area.create!({
          title_multiloc: runner.create_for_tenant_locales { 'Westbrook' },
          description_multiloc: runner.create_for_tenant_locales { '<p>The place to be these days</p>' }
        })
      end
    end
  end
end
