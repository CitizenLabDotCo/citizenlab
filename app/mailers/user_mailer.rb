class UserMailer < ApplicationMailer
  include LiquidTemplateHelpers


  def welcome(user)
    I18n.with_locale(user.locale) do
      @user = user
      default_liquid_params
      @intro = render_liquid_snippet user, 'intro'
      @step1 = render_liquid_snippet user, 'step1'
      subject = render_liquid_snippet user, 'subject'
      mail(to: @user.email, subject: subject)
    end
  end

  def reset_password(user, token)
    I18n.with_locale(user.locale) do
      @user = user
      @link_url = ["http://", Tenant.current.host, '/reset-password?token=', token].join
      subject = render_liquid_snippet user, 'subject'
      mail(to: @user.email, subject: subject)
    end
  end

  private

  def liquid_params user
    default_liquid_params.merge({
      "first_name" => user.first_name,
      "last_name" => user.last_name
    })
  end


end
