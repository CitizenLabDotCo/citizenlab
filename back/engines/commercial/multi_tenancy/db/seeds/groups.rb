# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Groups < Base
      def run
        3.times do
          Group.create!({
            membership_type: 'manual',
            title_multiloc: runner.create_for_some_locales { Faker::Lorem.sentence },
            projects: Project.all.shuffle.take(rand(Project.count)),
            members: User.all.shuffle.take(rand(User.count))
          })
        end
        Group.create!({
          membership_type: 'rules',
          title_multiloc: runner.create_for_some_locales { 'Go Vocal Heroes' },
          rules: [
            { ruleType: 'email', predicate: 'ends_on', value: '@govocal.com' }
          ]
        })
      end
    end
  end
end
