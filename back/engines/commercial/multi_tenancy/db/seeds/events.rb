# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Events < Base
      def run
        # Create some events with images
        5.times do
          start_at = Time.zone.now + rand(100).days
          event = ::Event.create!(
            title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
            description_multiloc: runner.rand_description_multiloc,
            location_multiloc: { en: '201 Demo Street' },
            start_at: start_at,
            end_at: start_at + rand(10).hours,
            project: runner.rand_instance(Project.all)
          )

          ::EventImage.create!({
            event: event,
            image: Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open
          })
        end

        # Add some attendees
        10.times do
          ::Events::Attendance.create(
            event: runner.rand_instance(Event.all),
            attendee: runner.rand_instance(User.active.all)
          )
        end
      end
    end
  end
end
