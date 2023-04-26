# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Polls
        class Response < Base
          ref_attributes %i[participation_context user]
        end
      end
    end
  end
end
