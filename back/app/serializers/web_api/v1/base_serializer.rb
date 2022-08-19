# frozen_string_literal: true

class WebApi::V1::BaseSerializer
  include FastJsonapi::ObjectSerializer

  def self.current_user(params)
    throw 'current_user missing in serializer parameters' unless params.include?(:current_user)
    params[:current_user]
  end

  def self.signed_in?(_object, params)
    !!current_user(params)
  end
end
