# frozen_string_literal: true

module FlagInappropriateContent
  class WebApi::V1::InappropriateContentFlagSerializer < ::WebApi::V1::BaseSerializer
    attributes :toxicity_label, :deleted_at
    attribute :reason_code do |flag|
      if flag.deleted?
        nil
      else
        flag.reason_code
      end
    end

    # We specify the serializer(s) for the flaggable object(s), because if we just use polymorphic: true
    # jsonapi-serializer will look for the serializer(s) in the same namespace as this serializer, which will fail.
    belongs_to :flaggable, serializer: proc { |object|
      if object.instance_of? Comment
        ::WebApi::V1::CommentSerializer
      elsif object.instance_of? Idea
        ::WebApi::V1::IdeaSerializer
      else
        ::WebApi::V1::InitiativeSerializer
      end
    }
  end
end
