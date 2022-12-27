# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Volunteers < Base
      def run
        20.times do
          Volunteering::Volunteer.create(
            cause: runner.rand_instance(Volunteering::Cause.all),
            user: runner.rand_instance(User.active.all)
          )
        end
      end
    end
  end
end
