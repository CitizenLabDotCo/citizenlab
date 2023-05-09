# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class InitiativeStatus < Base
        attributes %i[code color description_multiloc ordering title_multiloc]
      end
    end
  end
end
