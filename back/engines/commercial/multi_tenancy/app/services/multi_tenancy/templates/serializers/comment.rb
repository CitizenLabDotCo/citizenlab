# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Comment < Base
        ref_attributes %i[author idea parent]
        attributes %i[body_multiloc publication_status author_hash anonymous]
        attribute(:body_updated_at) { |comment| serialize_timestamp(comment.body_updated_at) }
      end
    end
  end
end
