require 'active_support/concern'

module LiquidTemplateHelpers
  extend ActiveSupport::Concern

  def lookup_liquid_template mailer, email, snippet, locale
    email_snippet = EmailSnippet.find_by(email: email, snippet: snippet, locale: locale)
    template = if email_snippet
      email_snippet.body
    else
      File.read(Rails.root.join('app','views',mailer.name.underscore,email,"#{snippet}.#{locale}.liquid"))
    end
    Liquid::Template.parse(template)
  end

  def default_liquid_params
    {
      "organization_name" => MultilocService.new.t(AppConfiguration.instance.settings('core', 'organization_name')),
      "organization_type" => AppConfiguration.instance.settings('core', 'organization_type')
    }
  end

  def render_liquid_snippet user, snippet
    template = lookup_liquid_template(self.class, action_name, snippet, user.locale)
    template.render(liquid_params(user))
  end

end