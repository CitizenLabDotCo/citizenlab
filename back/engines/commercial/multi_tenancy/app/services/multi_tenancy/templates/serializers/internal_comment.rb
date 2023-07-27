# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class InternalComment < Base
        ref_attributes %i[author post parent]
        attributes %i[body publication_status]
        attribute(:body_updated_at) { |internal_comment| serialize_timestamp(internal_comment.body_updated_at) }
      end
    end
  end
end
