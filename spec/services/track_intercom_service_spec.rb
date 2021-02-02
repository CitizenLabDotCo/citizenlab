require "rails_helper"

describe TrackIntercomService do
  let(:intercom) {
    double(INTERCOM_CLIENT)
  }
  let(:service) { TrackIntercomService.new intercom }

  describe "identify_user" do

    it "doesn't interact with intercom when the given user is not an admin or moderator" do
      user = create(:user)
      super_admin = create(:super_admin)

      expect(intercom).not_to receive(:search)

      service.identify_user(user)
      service.identify_user(super_admin)
    end

    it "creates an intercom contact if the contact didn't exist yet" do
      tenant = Tenant.current
      user = create(:admin)

      contacts_api = double()
      expect(intercom).to receive(:contacts).twice.and_return(contacts_api)

      expect(contacts_api).to receive(:search)
        .and_return(OpenStruct.new({count: 0}))

      contact = double()
      expect(contacts_api).to receive(:create).with({
        role: 'user',
        external_id: user.id,
        email: user.email,
        name: "#{user.first_name} #{user.last_name}",
        signed_up_at: user.registration_completed_at,
        custom_attributes: {
          tenantId: tenant.id,
          tenantName: "test-tenant",
          tenantHost: "example.org",
          tenantOrganizationType: "medium_city",
          tenantLifecycleStage: "active",
          isAdmin: true,
          isSuperAdmin: false,
          isProjectModerator: false,
          highestRole: 'admin',
          firstName: user.first_name,
          lastName: user.last_name,
          locale: user.locale
        }
      }).and_return(contact)

      companies_api = double()
      expect(intercom).to receive(:companies).and_return(companies_api)
      expect(companies_api).to receive(:find).with(id: tenant.id)
        .and_return(double(id: "123"))
      expect(contact).to receive(:add_company).with(id: "123")

      service.identify_user(user)
    end

    it "updates an intercom contact if it already exist" do
      tenant = Tenant.current
      user = create(:admin)

      contacts_api = double()
      expect(intercom).to receive(:contacts).twice.and_return(contacts_api)

      contact = double()
      expect(contacts_api).to receive(:search)
        .and_return(double({count: 1, :[] => contact}))

      expect(contact).to receive(:role=).with('user')
      expect(contact).to receive(:external_id=).with(user.id)
      expect(contact).to receive(:email=).with(user.email)
      expect(contact).to receive(:name=).with("#{user.first_name} #{user.last_name}")
      expect(contact).to receive(:signed_up_at=).with(user.registration_completed_at)
      expect(contact).to receive(:custom_attributes=).with({
        tenantId: tenant.id,
        tenantName: "test-tenant",
        tenantHost: "example.org",
        tenantOrganizationType: "medium_city",
        tenantLifecycleStage: "active",
        isAdmin: true,
        isSuperAdmin: false,
        isProjectModerator: false,
        highestRole: 'admin',
        firstName: user.first_name,
        lastName: user.last_name,
        locale: user.locale
      })

      expect(contacts_api).to receive(:save).with(contact).and_return(contact)

      companies_api = double()
      expect(intercom).to receive(:companies).and_return(companies_api)
      expect(companies_api).to receive(:find).with(id: tenant.id)
        .and_return(double(id: "123"))
      expect(contact).to receive(:add_company).with(id: "123")

      service.identify_user(user)
    end

  end

  describe "identify_tenant" do

    it "creates a company in Intercom if it didn't exist yet" do
      tenant = Tenant.current

      companies_api = double()
      expect(intercom).to receive(:companies).twice.and_return(companies_api)

      expect(companies_api).to receive(:find).and_raise(Intercom::ResourceNotFound.new("not found"))
      expect(companies_api).to receive(:create).with({
        company_id: tenant.id,
        remote_created_at: tenant.created_at,
        website: "https://example.org",
        name: "test-tenant",
        custom_attributes: {
          tenantId: tenant.id,
          tenantName: "test-tenant",
          tenantHost: "example.org",
          tenantOrganizationType: "medium_city",
          tenantLifecycleStage: "active",
        }
      })

      service.identify_tenant(tenant)
    end

    it "updates the corresponding company in Intercom if it exists already" do
      tenant = Tenant.current

      companies_api = double()
      expect(intercom).to receive(:companies).twice.and_return(companies_api)

      company = double()
      expect(companies_api).to receive(:find).with(id: tenant.id).and_return(company)

      expect(company).to receive(:name=).with("test-tenant")
      expect(company).to receive(:website=).with("https://example.org")
      expect(company).to receive(:custom_attributes=).with({
        tenantId: tenant.id,
        tenantName: "test-tenant",
        tenantHost: "example.org",
        tenantOrganizationType: "medium_city",
        tenantLifecycleStage: "active",  
      })

      expect(companies_api).to receive(:save).with(company)

      service.identify_tenant(tenant)
    end
  end

  describe "track" do

    it "doesn't interact with intercom when the given user is not an admin or moderator" do
      user = create(:user)
      super_admin = create(:super_admin)

      service.track_activity(build(:activity, user: user))
      service.track_activity(build(:activity, user: super_admin))
    end

    it "sends the activity to Intercom" do
      tenant = Tenant.current

      admin = create(:admin)
      activity = build(:activity, user: admin)

      events_api = double()
      expect(intercom).to receive(:events).and_return(events_api)

      expect(events_api).to receive(:create).with({
        event_name: "Idea published",
        created_at: activity.acted_at,
        user_id: admin.id,
        metadata: {
          source: 'cl2-back',
          item_id: activity.item_id,
          item_type: activity.item_type,
          cl2_cluster: 'local',
          action: 'published',
          tenantId: tenant.id,
          tenantName: "test-tenant",
          tenantHost: "example.org",
          tenantOrganizationType: "medium_city",
          tenantLifecycleStage: "active",
        }
      })

      service.track_activity(activity)
    end
  end
end
