# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      class CustomBlockAISessionSerializer < ::WebApi::V1::BaseSerializer
        set_type :custom_block_ai_session
        attributes :status, :created_at

        attribute :transcript_length do |session|
          session.transcript.length
        end
      end
    end
  end
end
