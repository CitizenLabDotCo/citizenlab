# frozen_string_literal: true

class WebApi::V1::BaseSerializer
  include JSONAPI::Serializer

  def self.current_user(params)
    throw 'current_user missing in serializer parameters' unless params.include?(:current_user)
    params[:current_user]
  end

  # @return [ApplicationPolicy::UserContext,User]
  def self.user_context(params)
    params[:user_context] || params[:current_user] || raise('user_context missing in serializer parameters')
  end

  def self.signed_in?(_object, params)
    !!current_user(params)
  end
end
