# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class IdeaStatus < Base
        attributes %i[code color description_multiloc ordering title_multiloc participation_method]
      end
    end
  end
end
