class FrontendService
  # The main purpose of this service is to decouple all assumptions the backend
  # makes about the frontend into a common location.

  def home_url tenant=Tenant.current
    tenant.base_frontend_uri
  end

  def model_to_url model_instance, tenant=Tenant.current
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

    subroute && slug && "#{tenant.base_frontend_uri}/#{subroute}/#{slug}"
  end

  def signin_success_url tenant=Tenant.current
    "#{tenant.base_frontend_uri}/"
  end

  def signup_success_url tenant=Tenant.current
    "#{tenant.base_frontend_uri}/complete-signup"
  end

  def signin_failure_url tenant=Tenant.current
    "#{tenant.base_frontend_uri}/authentication-error"
  end

  def invite_url token, tenant=Tenant.current
    "#{tenant.base_frontend_uri}/invite?token=#{token}"
  end

end