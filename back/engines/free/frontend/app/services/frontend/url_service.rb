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
      when Initiative
        subroute = 'initiatives'
        slug = model_instance.slug
      when StaticPage
        subroute = 'pages'
        slug = model_instance.slug
      when User
        subroute = 'profile'
        slug = model_instance.slug
      when Comment # Comments do not have a path yet, we return the post path for now
        return model_to_path(model_instance.post)
      when OfficialFeedback # Official feedback do not have a path yet, we return the post path for now
        return model_to_path(model_instance.idea)
      when InternalComment # Internal comments are only implemented in the Back Office / Admin UI
        if model_instance.post_type == 'Idea'
          return "admin/projects/#{model_instance.post.project_id}/ideas/#{model_instance.post.id}##{model_instance.id}"
        elsif model_instance.post_type == 'Initiative'
          return "admin/initiatives/#{model_instance.post.id}##{model_instance.id}"
        end
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
      locale ? "#{url}/#{locale.locale_sym}" : url
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

    def initiatives_url(configuration = app_config_instance)
      "#{configuration.base_frontend_uri}/initiatives"
    end

    def admin_ideas_url(configuration = app_config_instance)
      "#{configuration.base_frontend_uri}/admin/ideas"
    end

    def admin_project_url(project_id, configuration = app_config_instance)
      project = Project.find(project_id)
      last_phase_id = project ? TimelineService.new.current_or_backup_transitive_phase(project)&.id : nil
      if last_phase_id
        "#{configuration.base_frontend_uri}/admin/projects/#{project_id}/phases/#{last_phase_id}/ideas"
      else
        "#{configuration.base_frontend_uri}/admin/projects/#{project_id}/settings"
      end
    end

    def admin_initiatives_url(configuration = app_config_instance)
      "#{configuration.base_frontend_uri}/admin/initiatives"
    end

    def idea_edit_url(configuration, idea_id)
      "#{configuration.base_frontend_uri}/ideas/edit/#{idea_id}"
    end

    def reset_confirmation_code_url(options = {})
      "#{home_url(options)}/reset-confirmation-code"
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

    # Memoized database query
    def app_config_instance
      @app_config_instance ||= AppConfiguration.instance
    end
  end
end
