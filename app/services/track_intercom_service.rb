# frozen_string_literal: true

class TrackIntercomService

  def initialize(intercom_client = INTERCOM_CLIENT)
    @intercom = intercom_client
  end

  # Here's how to add new attributes to the contact model
  # @intercom.data_attributes.create({ name: "isProjectModerator", model: "contact", data_type: "boolean" })

  # @param [User] user
  def identify_user(user)
    return unless @intercom && track_user?(user)

    if (contact = search_contact(user))
      update_contact(contact, user)
    else
      create_contact(user)
    end
  end

  # @param [User] user
  # @return [Boolean]
  def track_user?(user)
    return false if user.super_admin?

    user.admin? || user.project_moderator?
  end

  def identify_tenant(tenant)
    return unless @intercom

    company = @intercom.companies.find(id: tenant.id)
  rescue Intercom::ResourceNotFound
    create_company(tenant)
  else
    update_company(company, tenant)
  end

  def track_activity(activity)
    return unless @intercom
    return unless activity.user && track_user?(activity.user)

    event = {
      event_name: TrackingService.new.activity_event_name(activity),
      created_at: activity.acted_at,
      user_id: activity.user_id,
      metadata: activity_attributes(activity)
    }

    @intercom.events.create(event)
  end

  # @param [Activity] activity
  # @return [{Symbol=>Anything}]
  def activity_attributes(activity)
    {
      source: 'cl2-back',
      item_type: activity.item_type,
      item_id: activity.item_id,
      action: activity.action
    }
  end

  # @param [User] user
  # @return [{Symbol=>Anything}]
  def user_attributes(user)
    {
      firstName: user.first_name,
      lastName: user.last_name,
      locale: user.locale,
      isAdmin: user.admin?,
      isSuperAdmin: user.super_admin?,
      isProjectModerator: user.project_moderator?,
      highestRole: user.highest_role.to_s,
    }
  end

  # @return [{Symbol=>Anything}]
  def tenant_attributes(tenant)
    raise NotImplementedError
  end

  private

  # Search for the intercom contact corresponding to a user.
  #
  # @param [User] user
  def search_contact(user)
    contact_query = { field: 'external_id', operator: '=', value: user.id }.stringify_keys
    search_results = @intercom.contacts.search("query": contact_query)
    search_results[0] if search_results.count.positive?
  end

  # @param [User] user
  def create_contact(user)
    @intercom.contacts.create(
      role: 'user',
      external_id: user.id,
      email: user.email,
      name: user.full_name,
      signed_up_at: user.registration_completed_at,
      custom_attributes: user_attributes(user)
    )
  end

  # @param [User] user
  def update_contact(contact, user)
    contact.email = user.email
    contact.name = user.full_name
    contact.signed_up_at = user.registration_completed_at
    contact.custom_attributes = user_attributes(user)
    @intercom.contacts.save(contact)
    contact
  end

  def create_company(tenant)
    @intercom.companies.create(
      company_id: tenant.id,
      name: tenant.name,
      website: "https://#{tenant.host}",
      remote_created_at: tenant.created_at,
      custom_attributes: tenant_attributes(tenant)
    )
  end

  def update_company(company, tenant)
    company.name = tenant.name
    company.website = "https://#{tenant.host}"
    company.custom_attributes = tenant_attributes(tenant)
    @intercom.companies.save(company)
  end
end
