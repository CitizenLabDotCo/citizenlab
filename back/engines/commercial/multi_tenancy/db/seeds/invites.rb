# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Invites < Base
      def run
        5.times do
          Invite.create!(
            invitee: User.create!(email: Faker::Internet.email, locale: 'en', invite_status: 'pending',
              first_name: Faker::Name.first_name, last_name: Faker::Name.last_name)
          )
        end
      end
    end
  end
end
