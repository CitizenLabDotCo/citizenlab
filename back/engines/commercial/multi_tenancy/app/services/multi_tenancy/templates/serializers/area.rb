# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Area < Base
        attributes %i[description_multiloc include_in_onboarding ordering title_multiloc]
      end
    end
  end
end
