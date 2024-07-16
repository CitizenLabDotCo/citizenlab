# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Events
        class Attendance < Base
          ref_attributes %i[attendee event]
        end
      end
    end
  end
end
