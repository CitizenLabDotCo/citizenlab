# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Polls
        class ResponseOption < Base
          ref_attributes %i[response option]
        end
      end
    end
  end
end
