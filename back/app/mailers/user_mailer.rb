class UserMailer < ApplicationMailer
  include LiquidTemplateHelpers


  private

  def liquid_params user
    default_liquid_params.merge({
      "first_name" => user.first_name,
      "last_name" => user.last_name
    })
  end


end
