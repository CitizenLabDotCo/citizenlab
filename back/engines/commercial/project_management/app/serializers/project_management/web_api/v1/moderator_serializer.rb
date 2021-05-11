# frozen_string_literal: true

module ProjectManagement
  module WebApi
    module V1
      class ModeratorSerializer < ::WebApi::V1::BaseSerializer
        attributes :first_name, :last_name, :slug, :roles

        attribute :email, if: proc { |object, params|
          view_private_attributes? object, params
        }

        attribute :avatar, if: proc { |object|
          object.avatar
        } do |object|
          object.avatar.versions.map { |k, v| [k.to_s, v.url] }.to_h
        end

        attribute :is_moderator, if: proc { |_object, params|
          params[:project_id]
        } do |object, params|
          object.project_moderator? params[:project_id]
        end

        def self.view_private_attributes?(object, params = {})
          Pundit.policy!(current_user(params), object).view_private_attributes?
        end
      end
    end
  end
end
