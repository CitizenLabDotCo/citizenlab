class TrackIntercomService

  class Configuration
    attr_accessor :user_attributes_builder, :activity_attributes_builder, :tenant_attributes_builder

    def initialize
      @user_attributes_builder = TrackIntercomService::Helpers.method(:default_user_attributes)
      @activity_attributes_builder = TrackIntercomService::Helpers.method(:default_activity_attributes)
      @tenant_attributes_builder = nil
    end
  end

  module Helpers
    def self.default_user_attributes(user)
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

    def self.default_activity_attributes(activity)
      {
        source: 'cl2-back',
        item_type: activity.item_type,
        item_id: activity.item_id,
        action: activity.action
      }
    end
  end

  def self.setup
    @configuration ||= Configuration.new
    yield @configuration if block_given?
  end

  def self.method_missing(method_name, *args, &block)
    @configuration.respond_to?(method_name) ?
      @configuration.send(method_name, *args, &block) : super
  end

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

  def identify_tenant(tenant = nil)
    return unless @intercom
    tenant ||= Tenant.current
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
      metadata: build_activity_attributes(activity)
    }

    @intercom.events.create(event)
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

  def create_contact(user)
    @intercom.contacts.create(
      role: 'user',
      external_id: user.id,
      email: user.email,
      name: user.full_name,
      signed_up_at: user.registration_completed_at,
      custom_attributes: build_user_attributes(user)
    )
  end

  def update_contact(contact, user)
    contact.email = user.email
    contact.name = user.full_name
    contact.signed_up_at = user.registration_completed_at
    contact.custom_attributes = build_user_attributes(user)
    @intercom.contacts.save(contact)
    contact
  end

  def create_company(tenant)
    @intercom.companies.create(
      company_id: tenant.id,
      name: tenant.name,
      website: "https://#{tenant.host}",
      remote_created_at: tenant.created_at,
      custom_attributes: build_tenant_attributes(tenant)
    )
  end

  def update_company(company, tenant)
    company.name = tenant.name
    company.website = "https://#{tenant.host}"
    company.custom_attributes = build_tenant_attributes(tenant)
    @intercom.companies.save(company)
  end

  def build_user_attributes(user)
    return {} unless TrackIntercomService.user_attributes_builder
    TrackIntercomService.user_attributes_builder.call(user)
  end

  def build_activity_attributes(activity)
    return {} unless TrackIntercomService.activity_attributes_builder
    TrackIntercomService.activity_attributes_builder.call(activity)
  end

  def build_tenant_attributes(tenant)
    return {} unless TrackIntercomService.tenant_attributes_builder
    TrackIntercomService.tenant_attributes_builder.call(tenant)
  end

  def add_company_to_contact(contact, tenant)
    company = @intercom.companies.find(id: tenant.id)
    contact.add_company(id: company.id)
  rescue Intercom::ResourceNotFound
    # Ignored
  end

  setup
end
