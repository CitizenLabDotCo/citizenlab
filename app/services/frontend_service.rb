class FrontendService
  # The main purpose of this service is to decouple all assumptions the backend
  # makes about the frontend into a common location.

  def model_to_url model_instance, options={}
    subroute = nil
    slug = nil
    if model_instance.kind_of? Project
      subroute = 'projects'
      slug = model_instance.slug
    elsif model_instance.kind_of? Idea
      subroute = 'ideas'
      slug = model_instance.slug
    elsif model_instance.kind_of? Comment ### comments do not have a URL yet, we return the idea URL for now
      subroute = 'ideas'
      slug = model_instance.idea.slug
    elsif model_instance.kind_of? Page
      subroute = 'pages'
      slug = model_instance.slug
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

  def signin_success_url options={}
    home_url options
  end

  def signup_success_url options={}
    "#{home_url(options)}/complete-signup"
  end

  def signin_failure_url options={}
    "#{home_url(options)}/authentication-error"
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

end