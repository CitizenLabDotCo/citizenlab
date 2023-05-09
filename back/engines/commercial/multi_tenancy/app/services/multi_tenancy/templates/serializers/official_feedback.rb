# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class OfficialFeedback < Base
        ref_attributes %i[user post]
        attributes %i[author_multiloc body_multiloc]
      end
    end
  end
end
