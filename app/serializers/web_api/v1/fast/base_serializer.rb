class WebApi::V1::Fast::BaseSerializer
  include FastJsonapi::ObjectSerializer

  def self.current_user params
    throw 'current_user missing in serializer parameters' if !params.include?(:current_user)
    params[:current_user]
  end
end
