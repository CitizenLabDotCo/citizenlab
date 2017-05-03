class UserMailer < ApplicationMailer
  include LiquidTemplateHelpers


  def welcome(user)
    I18n.with_locale(user.locale) do
      @user = user
      byebug
      default_liquid_params
      @intro = render_liquid_snippet user, 'intro'
      @step1 = render_liquid_snippet user, 'step1'
      subject = render_liquid_snippet user, 'subject'
      mail(to: @user.email, subject: subject)
    end
  end

  def liquid_params user
    default_liquid_params.merge({
      "first_name" => user.first_name,
      "last_name" => user.last_name
    })
  end


end
