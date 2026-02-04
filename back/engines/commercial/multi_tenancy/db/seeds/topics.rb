# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Topics < Base
      def run
        3.times do
          GlobalTopic.create!({
            title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.word },
            description_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence }
          })
        end

        5.times do
          parent = DefaultInputTopic.create!({
            title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.word },
            description_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence }
          })
          rand(0..4).times do
            DefaultInputTopic.create!({
              title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.word },
              description_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
              parent: parent
            })
          end
        end
      end
    end
  end
end
