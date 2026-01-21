# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class GlobalTopics < Base
      def run
        3.times do
          GlobalTopic.create!({
            title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.word },
            description_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence }
          })
        end
      end
    end
  end
end
