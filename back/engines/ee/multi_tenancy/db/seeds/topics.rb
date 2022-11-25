# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Topics < Base
      def run
        3.times do
          Topic.create!({
            title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.word },
            description_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence }
          })
        end
      end
    end
  end
end
