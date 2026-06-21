# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class ProjectReview < Base
        ref_attributes %i[project requester reviewer]
        attribute(:approved_at) { |review| serialize_timestamp(review.approved_at) }
      end
    end
  end
end
