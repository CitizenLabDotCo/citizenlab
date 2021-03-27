module Volunteering
  class WebApi::V1::CauseSerializer < ::WebApi::V1::BaseSerializer
    attributes :title_multiloc, :description_multiloc, :volunteers_count, :ordering, :created_at, :updated_at

    belongs_to :participation_context, polymorphic: true

    has_one :user_volunteer, if: Proc.new { |object, params|
      signed_in? object, params
    }, record_type: :volunteer, serializer: WebApi::V1::VolunteerSerializer do |object, params|
      cached_user_volunteer object, params
    end

    def self.cached_user_volunteer object, params
      if params[:vbci]
        params.dig(:vbci, object.id)
      else
         object.volunteers.where(user_id: current_user(params)&.id).first
       end
    end

    attribute :image, if: Proc.new {|object| object.image} do |object|
      object.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
    end
  end
end