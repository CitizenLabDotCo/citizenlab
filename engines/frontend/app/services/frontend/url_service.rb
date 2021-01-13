module Frontend
  class UrlService
    # The main purpose of this service is to decouple all assumptions the backend
    # makes about the frontend URLs into a single location.

    def model_to_url model_instance, options={}
      subroute = nil
      slug = nil
      if model_instance.kind_of? Project
        subroute = 'projects'
        slug = model_instance.slug
      elsif model_instance.kind_of? Phase
        subroute = 'projects'
        slug = model_instance.project.slug
      elsif model_instance.kind_of? ProjectFolders::Folder
        subroute = 'folders'
        slug = model_instance.slug
      elsif model_instance.kind_of? Idea
        subroute = 'ideas'
        slug = model_instance.slug
      elsif model_instance.kind_of? Initiative
        subroute = 'initiatives'
        slug = model_instance.slug
      elsif model_instance.kind_of? Comment ### comments do not have a URL yet, we return the post URL for now
        return model_to_url(model_instance.post, options)
      elsif model_instance.kind_of? OfficialFeedback ### official feedbacks do not have a URL yet, we return the post URL for now
        return model_to_url(model_instance.post, options)
      elsif model_instance.kind_of? Page
        subroute = 'pages'
        slug = model_instance.slug
      end

      subroute && slug && "#{home_url(options)}/#{subroute}/#{slug}"
    end

    def slug_to_url slug, classname, options={}
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

    def home_url options={}
      tenant = options[:tenant] || Tenant.current
      locale = options[:locale]
      url = tenant.base_frontend_uri
      if locale
        "#{url}/#{locale}"
      else
        url
      end
    end

    def verification_url options={}
      pathname = options[:pathname]
      "#{home_url(options)}#{pathname}"
    end

    def signin_success_url options={}
      home_url options
    end

    def signup_success_url options={}
      "#{home_url(options)}/complete-signup"
    end

    def signin_failure_url options={}
      "#{home_url(options)}/authentication-error"
    end

    def verification_success_url options={}
      verification_url(options)
    end

    def verification_failure_url options={}
      verification_url(options)
    end

    def invite_url token, options={}
      "#{home_url(options)}/invite?token=#{token}"
    end

    def reset_password_url token, options={}
      "#{home_url(options)}/reset-password?token=#{token}"
    end

    def manifest_start_url options={}
      tenant = options[:tenant] || Tenant.current
      "#{tenant.base_frontend_uri}/?utm_source=manifest"
    end

    def unsubscribe_url_template tenant, campaign_id
      "#{tenant.base_frontend_uri}/email-settings?unsubscription_token={{unsubscription_token}}&campaign_id=#{campaign_id}"
    end

    def unsubscribe_url tenant, campaign_id, user_id
      token = EmailCampaigns::UnsubscriptionToken.find_by(user_id: user_id)&.token
      if token
        "#{tenant.base_frontend_uri}/email-settings?unsubscription_token=#{token}&campaign_id=#{campaign_id}"
      else
        home_url tenant: tenant
      end
    end

    def terms_conditions_url tenant: Tenant.current
      "#{tenant.base_frontend_uri}/pages/terms-and-conditions"
    end

    def privacy_policy_url tenant: Tenant.current
      "#{tenant.base_frontend_uri}/pages/privacy-policy"
    end

    def admin_ideas_url tenant: Tenant.current
      "#{tenant.base_frontend_uri}/admin/ideas"
    end

    def admin_initiatives_url tenant: Tenant.current
      "#{tenant.base_frontend_uri}/admin/initiatives"
    end

    def idea_edit_url tenant, idea_id
      "#{tenant.base_frontend_uri}/ideas/edit/#{idea_id}"
    end

  end
end
