# frozen_string_literal: true

require 'rails_helper'

describe TrackIntercomService do
  let(:intercom) { double(INTERCOM_CLIENT).as_null_object }
  let(:service) { described_class.new(intercom) }
  let(:tenant) { Tenant.current }
  let(:expected_tenant_props) do
    {
      tenantId: tenant.id,
      tenantName: 'test-tenant',
      tenantHost: 'example.org',
      tenantOrganizationType: 'medium_city',
      tenantLifecycleStage: 'active'
    }
  end

  describe 'identify_user' do
    it "creates a company in Intercom if it didn't exist yet" do
      user = create(:admin)
      contacts_api = double
      zero_contacts = { count: 0 }
      allow(contacts_api).to receive(:search).and_return(zero_contacts)
      expect(intercom).to receive(:contacts).twice.and_return(contacts_api)

      expect(contacts_api).to receive(:search)

      contact = double.as_null_object
      expect(contacts_api).to receive(:create) do |payload|
        expect(payload[:custom_attributes]).to include(expected_tenant_props)
      end.and_return(contact)

      service.identify_user(user)
    end

    it 'associates a company to new contacts' do
      user = create(:admin)

      contacts_api = double
      contact = double
      expect(intercom).to receive(:contacts).twice.and_return(contacts_api)
      allow(contacts_api).to receive(:search).and_return({ count: 0 })
      allow(contacts_api).to receive(:create).and_return(contact)

      companies_api = double
      allow(intercom).to receive(:companies).and_return(companies_api)
      allow(companies_api).to receive(:find).with(id: tenant.id).and_return(double(id: '123'))
      expect(contact).to receive(:add_company).with(id: '123')

      expect(contacts_api).to receive(:search)
      expect(contacts_api).to receive(:create)
      expect(intercom).to receive(:companies)
      expect(companies_api).to receive(:find).with(id: tenant.id)
      service.identify_user(user)
    end

    it 'includes tenant properties when updating a new contact' do
      user = create(:admin)

      contacts_api = double
      expect(intercom).to receive(:contacts).twice.and_return(contacts_api)

      contact = double.as_null_object
      search_result = double(:count => 1, :[] => contact)
      allow(contacts_api).to receive(:search).and_return(search_result)

      expect(contact).to receive(:custom_attributes=) do |attrs|
        expect(attrs).to include(expected_tenant_props)
      end
      expect(contacts_api).to receive(:save).with(contact)

      expect(contacts_api).to receive(:search)
      service.identify_user(user)
    end
  end

  describe 'identify_tenant' do
    it 'includes tenant properties when creating a new Intercom company' do
      companies_api = double
      expect(intercom).to receive(:companies).twice.and_return(companies_api)

      not_found = Intercom::ResourceNotFound.new('not found')
      allow(companies_api).to receive(:find).and_raise(not_found)

      expect(companies_api).to receive(:create).with(
        company_id: tenant.id,
        remote_created_at: tenant.created_at,
        website: 'https://example.org',
        name: 'test-tenant',
        custom_attributes: expected_tenant_props
      )

      expect(companies_api).to receive(:find)
      service.identify_tenant(tenant)
    end

    it 'updates the corresponding company in Intercom if it exists already' do
      companies_api = double
      expect(intercom).to receive(:companies).twice.and_return(companies_api)

      company = double
      allow(companies_api).to receive(:find).with(company_id: tenant.id).and_return(company)

      expect(company).to receive(:name=).with('test-tenant')
      expect(company).to receive(:website=).with('https://example.org')
      expect(company).to receive(:custom_attributes=).with(expected_tenant_props)
      expect(companies_api).to receive(:save).with(company)

      expect(companies_api).to receive(:find).with(company_id: tenant.id)
      service.identify_tenant(tenant)
    end
  end

  describe 'track_activity' do
    it 'includes tenant/environment properties when sending activities to Intercom' do
      admin = create(:admin)
      activity = build(:activity, user: admin)

      events_api = double
      allow(intercom).to receive(:events).and_return(events_api)

      expect(events_api).to receive(:create) do |payload|
        expect(payload[:metadata]).to include(expected_tenant_props.merge(cl2_cluster: 'local'))
      end

      expect(intercom).to receive(:events)
      service.track_activity(activity)
    end

    it 'does not trigger a call to intercom if the event is not whitelisted' do
      stub_const('INTERCOM_EVENT_WHITELIST', [])
      admin = create(:admin)
      activity = build(:activity, user: admin)

      expect(intercom).not_to receive(:events)
      service.track_activity(activity)
    end

    it 'triggers a call to intercom if the event is whitelisted' do
      stub_const('INTERCOM_EVENT_WHITELIST', ['Idea changed'])
      admin = create(:admin)
      activity = build(:activity, item: create(:idea), action: :changed, user: admin)

      expect(intercom).to receive(:events)
      service.track_activity(activity)
    end
  end
end
