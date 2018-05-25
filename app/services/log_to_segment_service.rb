class LogToSegmentService

  def tracking_message event_name, user_id, options={}
    user_id = options[:user_id] 
    timestamp = options[:timestamp] || Time.now
    tenant = options[:tenant] || Tenant.current
    payload = options[:payload] || {}
    msg = {
      event: event_name,
      timestamp: timestamp,
      properties: {
        source: 'cl2-back',
        payload: payload
      },
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantHost: tenant.host,
      tenantOrganizationType: tenant.settings.dig('core', 'organization_type'),
      tenantLifecycleStage: tenant.settings.dig('core', 'lifecycle_stage')
    }
    if user_id
      msg[:user_id] = user_id
    else
      msg[:anonymous_id] = SecureRandom.base64
    end
    msg
  end

end