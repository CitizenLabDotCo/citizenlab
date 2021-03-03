# frozen_string_literal: true

module Frontend
  # The main purpose of this service is to decouple all assumptions the backend
  # makes about the frontend URLs into a single location.
  class UrlService
    prepend_if_ee('ProjectFolders::Extensions::Frontend::UrlService')

    def model_to_url(model_instance, options = {})
      case model_instance
      when Project
        subroute = 'projects'
        slug = model_instance.slug
      when Phase
        subroute = 'projects'
        slug = model_instance.project.slug
      when ProjectFolders::Folder
        subroute = 'folders'
        slug = model_instance.slug
      when Idea
        subroute = 'ideas'
        slug = model_instance.slug
      when Initiative
        subroute = 'initiatives'
        slug = model_instance.slug
      when Page
        subroute = 'pages'
        slug = model_instance.slug
      when Comment ### comments do not have a URL yet, we return the post URL for now
        return model_to_url(model_instance.post, options)
      when OfficialFeedback ### official feedbacks do not have a URL yet, we return the post URL for now
        return model_to_url(model_instance.post, options)
      else
        subroute = nil
        slug = nil
      end

      subroute && slug && "#{home_url(options)}/#{subroute}/#{slug}"
    end

    def slug_to_url(slug, classname, options = {})
      # Does not cover phases, comments and official feedback
      subroute = nil
      case classname
      when 'Project'
        subroute = 'projects'
      when 'Idea'
        subroute = 'ideas'
      when 'Initiative'
        subroute = 'initiatives'
      when 'Page'
        subroute = 'pages'
      end

      subroute && slug && "#{home_url(options)}/#{subroute}/#{slug}"
    end

    def home_url(options = {})
      url = config_from_options(options).base_frontend_uri
      locale = options[:locale]
      locale ? "#{url}/#{locale}" : url
    end

    def verification_url(options = {})
      pathname = options[:pathname]
      "#{home_url(options)}#{pathname}"
    end

    def signin_success_url(options = {})
      home_url(options)
    end

    def signup_success_url(options = {})
      "#{home_url(options)}/complete-signup"
    end

    def signin_failure_url(options = {})
      "#{home_url(options)}/authentication-error"
    end

    def verification_success_url(options = {})
      verification_url(options)
    end

    def verification_failure_url(options = {})
      verification_url(options)
    end

    def invite_url(token, options = {})
      "#{home_url(options)}/invite?token=#{token}"
    end

    def reset_password_url(token, options = {})
      "#{home_url(options)}/reset-password?token=#{token}"
    end

    def manifest_start_url(options = {})
      configuration = config_from_options(options)
      "#{configuration.base_frontend_uri}/?utm_source=manifest"
    end

    def unsubscribe_url_template(configuration, campaign_id)
      "#{configuration.base_frontend_uri}/email-settings?unsubscription_token={{unsubscription_token}}&campaign_id=#{campaign_id}"
    end

    def unsubscribe_url(configuration, campaign_id, user_id)
      token = EmailCampaigns::UnsubscriptionToken.find_by(user_id: user_id)&.token
      if token
        "#{configuration.base_frontend_uri}/email-settings?unsubscription_token=#{token}&campaign_id=#{campaign_id}"
      else
        home_url(app_configuration: configuration)
      end
    end

    def terms_conditions_url(configuration = AppConfiguration.instance)
      "#{configuration.base_frontend_uri}/pages/terms-and-conditions"
    end

    def privacy_policy_url(configuration = AppConfiguration.instance)
      "#{configuration.base_frontend_uri}/pages/privacy-policy"
    end

    def initiatives_url(configuration = AppConfiguration.instance)
      "#{configuration.base_frontend_uri}/initiatives"
    end

    def admin_ideas_url(configuration = AppConfiguration.instance)
      "#{configuration.base_frontend_uri}/admin/ideas"
    end

    def admin_project_ideas_url(project_id, configuration = AppConfiguration.instance)
      "#{configuration.base_frontend_uri}/admin/projects/#{project_id}/ideas"
    end

    def admin_initiatives_url(configuration = AppConfiguration.instance)
      "#{configuration.base_frontend_uri}/admin/initiatives"
    end

    def idea_edit_url(configuration, idea_id)
      "#{configuration.base_frontend_uri}/ideas/edit/#{idea_id}"
    end

    private

    # @return [AppConfiguration]
    def config_from_options(options)
      tenant = options[:tenant]
      if tenant # Show a deprecation message is tenant options is used
        ActiveSupport::Deprecation.warn(":tenant options is deprecated, use :app_configuration instead.") # MT_TODO to be removed
      end
      options[:app_configuration] || tenant&.configuration || AppConfiguration.instance # TODO OS remove: tenant&.configuration
    end

  end
end
