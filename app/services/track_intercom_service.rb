class TrackIntercomService

  def initialize(intercom_client = IntercomClient)
    @intercom = intercom_client
  end

  # Here's how to add new attributes to the contact model
  # @intercom.data_attributes.create({ name: "isProjectModerator", model: "contact", data_type: "boolean" })

  # @param [User] user
  # @param [Tenant] tenant
  def identify_user(user, tenant)
    return unless @intercom && track_user?(user)

    contact = search_contact(user)
    custom_attributes = user_custom_attributes(user, tenant)

    if contact
      contact.role = "user"
      contact.email = user.email
      contact.name = user.full_name
      contact.signed_up_at = user.registration_completed_at
      contact.custom_attributes = custom_attributes
      @intercom.contacts.save(contact)
    else
      contact = @intercom.contacts.create(
        role: 'user',
        external_id: user.id,
        email: user.email,
        name: user.full_name,
        signed_up_at: user.registration_completed_at,
        custom_attributes: custom_attributes
      )
    end

    add_company_to_contact(contact, tenant)
  end

  def identify_tenant(tenant)
    return unless @intercom
    company = @intercom.companies.find(id: tenant.id)
  rescue Intercom::ResourceNotFound
    @intercom.companies.create(
      company_id: tenant.id,
      name: tenant.name,
      website: "https://#{tenant.host}",
      remote_created_at: tenant.created_at,
      custom_attributes: TrackingService.new.tenant_properties(tenant)
    )
  else
    company.name = tenant.name
    company.website = "https://#{tenant.host}"
    company.custom_attributes = TrackingService.new.tenant_properties(tenant)
    @intercom.companies.save(company)
  end

  def track(activity, tenant = Tenant.current)
    return unless @intercom
    return unless activity.user && track_user?(activity.user)

    service = TrackingService.new

    event_metadata = {
      source: 'cl2-back',
      **service.tenant_properties(tenant),
      **service.environment_properties,
      item_type: activity.item_type,
      item_id: activity.item_id,
      action: activity.action
    }

    event = {
      event_name: service.activity_event_name(activity),
      created_at: activity.acted_at,
      user_id: activity.user_id,
      metadata: event_metadata
    }

    @intercom.events.create(event)
  end

  private

  # @param [User] user
  # @param [Tenant] tenant
  def user_custom_attributes(user, tenant)
    {
      firstName: user.first_name,
      lastName: user.last_name,
      locale: user.locale,
      isAdmin: user.admin?,
      isSuperAdmin: user.super_admin?,
      isProjectModerator: user.project_moderator?,
      highestRole: user.highest_role.to_s,
      **TrackingService.new.tenant_properties(tenant)
    }
  end

  # Search for the intercom contact corresponding to a user.
  #
  # @param [User] user
  def search_contact(user)
    contact_query = { field: 'external_id', operator: '=', value: user.id }.stringify_keys
    search_results = @intercom.contacts.search("query": contact_query)
    search_results[0] if search_results.count.positive?
  end

  # @param [User] user
  def track_user?(user)
    return false if user.super_admin?
    user.admin? || user.project_moderator?
  end


  def add_company_to_contact(contact, tenant)
    company = @intercom.companies.find(id: tenant.id)
    contact.add_company(id: company.id)
  rescue Intercom::ResourceNotFound
    # Ignored
  end
end
