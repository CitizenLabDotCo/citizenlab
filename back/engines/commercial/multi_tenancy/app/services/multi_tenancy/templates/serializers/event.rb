# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Event < Base
        ref_attribute :project

        attributes %i[
          address_1
          address_2_multiloc
          attend_button_multiloc
          description_multiloc
          location_multiloc
          maximum_attendees
          online_link
          title_multiloc
          using_url
        ]

        attribute(:start_at) { |event| serialize_timestamp(event.start_at) }
        attribute(:end_at) { |event| serialize_timestamp(event.end_at) }
      end
    end
  end
end
