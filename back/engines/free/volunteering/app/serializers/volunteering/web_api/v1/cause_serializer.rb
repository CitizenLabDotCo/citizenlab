# frozen_string_literal: true

module Volunteering
  class WebApi::V1::CauseSerializer < ::WebApi::V1::BaseSerializer
    attributes :title_multiloc, :description_multiloc, :volunteers_count, :ordering, :created_at, :updated_at

    # We specify the namespace for the serializer(s), because if we just use polymorphic: true
    # jsonapi-serializer will look for the serializer(s) in the same namespace as this serializer, which will fail.
    belongs_to :participation_context, serializer: proc { |object|
      "::WebApi::V1::#{object.class.name}Serializer".constantize
    }

    has_one :user_volunteer, if: proc { |object, params|
      signed_in? object, params
    }, record_type: :volunteer, serializer: WebApi::V1::VolunteerSerializer do |object, params|
      cached_user_volunteer object, params
    end

    def self.cached_user_volunteer(object, params)
      if params[:vbci]
        params.dig(:vbci, object.id)
      else
        object.volunteers.where(user_id: current_user(params)&.id).first
      end
    end

    attribute :image, if: proc { |object| object.image } do |object|
      object.image.versions.to_h { |k, v| [k.to_s, v.url] }
    end
  end
end
