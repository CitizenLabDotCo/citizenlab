# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Volunteering
        class Volunteer < Base
          ref_attributes %i[cause user]
        end
      end
    end
  end
end
