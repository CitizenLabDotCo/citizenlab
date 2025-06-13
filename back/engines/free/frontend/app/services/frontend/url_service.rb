# frozen_string_literal: true

module Frontend
  # The main purpose of this service is to decouple all assumptions the backend
  # makes about the frontend URLs into a single location.
  class UrlService
    def model_to_path(model_instance)
      case model_instance
      when Project
        subroute = 'projects'
        slug = model_instance.slug
      when Phase
        subroute = model_to_path model_instance.project
        slug = TimelineService.new.phase_number model_instance
      when Idea
        subroute = 'ideas'
        slug = model_instance.slug
      when StaticPage
        subroute = 'pages'
        slug = model_instance.slug
      when User
        subroute = 'profile'
        slug = model_instance.slug
      when Comment, OfficialFeedback # Comments and official feedback do not have a path yet, we return the idea path for now
        return model_to_path(model_instance.idea)
      when InternalComment # Internal comments are only implemented in the Back Office / Admin UI
        return "admin/projects/#{model_instance.idea.project_id}/ideas/#{model_instance.idea.id}##{model_instance.id}"
      when Analysis::Analysis
        project_id = model_instance.source_project.id
        phase_id = model_instance.phase_id
        analysis_id = model_instance.id
        return "admin/projects/#{project_id}/analysis/#{analysis_id}#{phase_id ? "?phase_id=#{phase_id}" : ''}"
      when ProjectFolders::Folder
        subroute = 'folders'
        slug = model_instance.slug
      when Event
        subroute = 'events'
        slug = model_instance.id
      else
        subroute = nil
        slug = nil
      end

      subroute && slug && "#{subroute}/#{slug}"
    end

    def model_to_url(model_instance, options = {})
      path = model_to_path model_instance
      path && "#{home_url(options)}/#{path}"
    end

    def admin_project_folder_url(project_folder_id, locale: nil)
      locale ||= Locale.default(config: app_config_instance)
      "#{app_config_instance.base_frontend_uri}/#{locale.to_sym}/admin/projects/folders/#{project_folder_id}"
    end

    def slug_to_url(slug, classname, options = {})
      # Does not cover phases, comments and official feedback
      subroute = nil
      case classname
      when 'Project'
        subroute = 'projects'
      when 'Idea'
        subroute = 'ideas'
      when 'Page'
        subroute = 'pages'
      end

      subroute && slug && "#{home_url(options)}/#{subroute}/#{slug}"
    end

    def home_url(options = {})
      url = config_from_options(options).base_frontend_uri
      locale = options[:locale]
      locale ? "#{url}/#{locale.locale_sym}" : url
    end

    def sso_return_url(options = {})
      pathname = options[:pathname] || '/'
      pathname = strip_existing_locale_from_path(pathname) if options[:locale]
      "#{home_url(options)}#{pathname}"
    end

    def verification_return_url(options = {})
      pathname = options[:pathname]
      "#{home_url(options)}#{pathname}"
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

    def unfollow_url(follower)
      locale = follower.user ? Locale.new(follower.user.locale) : nil
      url = model_to_url(follower.followable, locale: follower.user.presence && locale)
      url || "#{home_url(locale: locale)}/profile/#{follower.user.slug}/following"
    end

    def terms_conditions_url(configuration = app_config_instance)
      "#{configuration.base_frontend_uri}/pages/terms-and-conditions"
    end

    def privacy_policy_url(configuration = app_config_instance)
      "#{configuration.base_frontend_uri}/pages/privacy-policy"
    end

    def admin_ideas_url(configuration = app_config_instance)
      "#{configuration.base_frontend_uri}/admin/ideas"
    end

    def admin_project_url(project_id, configuration = app_config_instance)
      "#{configuration.base_frontend_uri}/admin/projects/#{project_id}"
    end

    def idea_edit_url(configuration, idea_id)
      "#{configuration.base_frontend_uri}/ideas/edit/#{idea_id}"
    end

    def reset_confirmation_code_url(options = {})
      "#{home_url(options)}/reset-confirmation-code"
    end

    def profile_surveys_url(user_slug, options = {})
      "#{home_url(options)}/profile/#{user_slug}/surveys"
    end

    private

    # @return [AppConfiguration]
    def config_from_options(options)
      tenant = options[:tenant]
      if tenant # Show a deprecation message is tenant options is used
        ActiveSupport::Deprecation.warn(':tenant options is deprecated, use :app_configuration instead.') # MT_TODO to be removed
      end
      options[:app_configuration] || tenant&.configuration || app_config_instance # TODO: OS remove: tenant&.configuration
    end

    def strip_existing_locale_from_path(pathname)
      # NOTE: Assumes the path is always passed with a leading slash & locale is always the first segment
      pathname.gsub(%r{^/([a-z]{2}(-[A-Z]{2})?)(/(.*))}, '\3')
    end

    # Memoized database query
    def app_config_instance
      @app_config_instance ||= AppConfiguration.instance
    end
  end
end
