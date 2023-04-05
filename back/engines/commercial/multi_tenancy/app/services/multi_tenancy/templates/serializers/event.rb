# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Event < Base
        ref_attribute :project

        attributes %i[description_multiloc location_multiloc title_multiloc]

        attribute(:start_at) { |event| serialize_timestamp(event.start_at) }
        attribute(:end_at) { |event| serialize_timestamp(event.end_at) }
      end
    end
  end
end
