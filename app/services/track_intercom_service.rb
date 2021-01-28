class TrackIntercomService

  def initialize(intercom_client = IntercomClient)
    @intercom = intercom_client
  end

  # Here's how to add new attributes to the contact model
  # @intercom.data_attributes.create({ name: "isProjectModerator", model: "contact", data_type: "boolean" })
  def identify_user user, tenant
    if @intercom && (user.admin? || user.project_moderator?) && !user.super_admin?
     contact_search = @intercom.contacts.search(
      "query": {
        "field": 'external_id',
        "operator": '=',
        "value": user.id
      })

      contact = if contact_search.count.positive?
        contact = contact_search[0]
        contact.role = "user"
        contact.external_id = user.id
        contact.email = user.email
        contact.name = user.first_name + " " +  user.last_name
        contact.signed_up_at =  user.registration_completed_at
        contact.custom_attributes = {
          firstName: user.first_name,
          lastName: user.last_name,
          locale: user.locale,
          isAdmin: user.admin?,
          isSuperAdmin: user.super_admin?,
          isProjectModerator: user.project_moderator?,
          highestRole: user.highest_role.to_s,
          **TrackingService.new.tenant_properties(tenant)
        }
        @intercom.contacts.save(contact)
      else
        @intercom.contacts.create(
          role: 'user',
          external_id: user.id,
          email: user.email,
          name: user.first_name + ' ' + user.last_name,
          signed_up_at:  user.registration_completed_at,
          custom_attributes: {
            firstName: user.first_name,
            lastName: user.last_name,
            locale: user.locale,
            isAdmin: user.admin?,
            isSuperAdmin: user.super_admin?,
            isProjectModerator: user.project_moderator?,
            highestRole: user.highest_role.to_s,
            **TrackingService.new.tenant_properties(tenant)
          }
        )
      end

      if tenant
        begin
          company = @intercom.companies.find(id: tenant.id)
          contact.add_company(id: company.id)
        rescue Intercom::ResourceNotFound
        end
      end
    end
  end

  def identify_tenant tenant
    if @intercom
      begin
        company = @intercom.companies.find(id: tenant.id)
        company.name = tenant.name
        company.website = "https://#{tenant.host}"
        company.custom_attributes = TrackingService.new.tenant_properties(tenant)
        @intercom.companies.save(company)
      rescue Intercom::ResourceNotFound
        @intercom.companies.create({
          company_id: tenant.id,
          name: tenant.name,
          website: "https://#{tenant.host}",
          remote_created_at: tenant.created_at,
          custom_attributes: TrackingService.new.tenant_properties(tenant)
        })
      end
    end
  end

  def track activity, tenant
    if activity.user && @intercom && (activity.user.admin? || activity.user.project_moderator?) && !activity.user.super_admin?
      service = TrackingService.new()

      event = {
        event_name: service.activity_event_name(activity),
        created_at: activity.acted_at,
        user_id: activity.user_id,
        metadata: {
          source: 'cl2-back',
          **service.tenant_properties(tenant),
          **service.environment_properties,
          item_type: activity.item_type,
          item_id: activity.item_id,
          action: activity.action
        }
      }

      @intercom.events.create(event)
    end
  end
end
