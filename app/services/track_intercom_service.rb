class TrackIntercomService

  # Here's how to add new attributes to the contact model
  # IntercomInstance.data_attributes.create({ name: "isProjectModerator", model: "contact", data_type: "boolean" })
  def identify_user user, tenant
    if IntercomInstance && (user.admin? || user.project_moderator?) && !user.super_admin?
     contact_search = IntercomInstance.contacts.search(
      "query": {
        "field": 'external_id',
        "operator": '=',
        "value": user.id
      })

      if contact_search.count.positive?
        contact = contact_search[0]
        contact.role = "user"
        contact.external_id = user.id
        contact.email = user.email
        contact.name = user.first_name + " " +  user.last_name
        contact.signed_up_at =  user.created_at
        contact.custom_attributes = {
          isAdmin: user.admin?,
          isSuperAdmin: user.super_admin?,
          isProjectModerator: user.project_moderator?,
          highestRole: user.highest_role
        }
        IntercomInstance.contacts.save(contact)
      else
      contact = IntercomInstance.contacts.create(
        role: 'user',
        external_id: user.id,
        email: user.email,
        name: user.first_name + ' ' + user.last_name,
        signed_up_at:  user.created_at,
        custom_attributes: {
          isAdmin: user.admin?,
          isSuperAdmin: user.super_admin?,
          isProjectModerator: user.project_moderator?,
          highestRole: user.highest_role
        }
      )
      end
      if tenant
        begin
          company = IntercomInstance.companies.find(id: tenant.id)
          contact.add_company(id: company.id)
        rescue Intercom::ResourceNotFound
        end
      end
    end
  end

  def identify_tenant tenant
    if IntercomInstance
      begin
        company = IntercomInstance.companies.find(id: tenant.id)
        company.name = tenant.name,
        company.website = "https://#{tenant.host}"
        company.avatar = tenant&.logo&.medium&.url
        company.createdAt = tenant.created_at
        company.tenantLocales = tenant.settings.dig('core', 'locales')
        TrackingService.new.add_tenant_properties(company, tenant)
        IntercomInstance.companies.save(company)
      rescue Intercom::ResourceNotFound
        traits = {
         name: tenant.name,
          website: "https://#{tenant.host}",
          avatar: tenant&.logo&.medium&.url,
          createdAt: tenant.created_at,
          tenantLocales: tenant.settings.dig('core', 'locales')
        }
        TrackingService.new.add_tenant_properties(traits, tenant)
        IntercomInstance.companies.create(traits)
      end
    end
  end

  def track activity
    if activity.user && IntercomInstance && (activity.user.admin? || activity.user.project_moderator?) && !activity.user.super_admin?
      event = {
        event_name: service.activity_event_name(activity),
        created_at: activity.acted_at,
        user_id: event[:user_id],
        metadata: {
          source: 'cl2-back'
        }
      }
      service = TrackingService.new()
      service.add_activity_properties event[:metadata], activity

      service.add_activity_item_content event, event[:metadata], activity
      service.add_environment_properties event[:metadata]
      Intercom.events.create(event)
    end
  end
end
