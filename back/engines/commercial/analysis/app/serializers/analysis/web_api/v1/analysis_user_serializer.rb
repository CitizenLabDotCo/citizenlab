# frozen_string_literal: true

# This is a very light version of the user serializer. The analysis feature
# requires very little information on the user, so this massively speeds up the
# rendering of `GET /inputs`, where the authors are `included`
module Analysis
  module WebApi
    module V1
      class AnalysisUserSerializer < ::WebApi::V1::BaseSerializer
        set_type :analysis_user

        attributes :locale, :created_at, :updated_at

        attribute :slug do |object, params|
          object.slug if params[:view_private_attributes]
        end

        attribute :last_name do |object, params|
          name_service = UserDisplayNameService.new(params[:app_configuration], current_user(params))
          name_service.last_name(object) if params[:view_private_attributes]
        end

        attribute :first_name do |object, params|
          name_service = UserDisplayNameService.new(params[:app_configuration], current_user(params))
          name_service.first_name(object) if params[:view_private_attributes]
        end

        attribute :avatar, if: proc { |object|
          object.avatar
        } do |object, params|
          object.avatar.versions.to_h { |k, v| [k.to_s, v.url] } if params[:view_private_attributes]
        end
      end
    end
  end
end
