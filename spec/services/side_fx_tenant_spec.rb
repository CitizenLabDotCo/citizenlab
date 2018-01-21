require "rails_helper"

describe SideFxTenantService do
  let(:service) { SideFxTenantService.new }
  let(:current_user) { create(:user) }
  let(:tenant) { create(:tenant) }


  describe "after_create" do
    it "logs a 'created' action" do
      expect {service.after_create(tenant, current_user)}.
        to have_enqueued_job(LogActivityJob).with(tenant, 'created', current_user, tenant.updated_at.to_i)
    end

    it "starts a GroupToSegmentJob" do
      expect {service.after_create(tenant, current_user)}.
        to have_enqueued_job(GroupToSegmentJob).with(tenant)
    end

  end

  describe "after_update" do
    it "logs a changed action job when the tenant has changed" do
      settings = tenant.settings
      settings['core']['organization_name'] = "New name"
      tenant.update(settings: settings)
      expect {service.after_update(tenant, current_user)}.
        to have_enqueued_job(LogActivityJob).with(tenant, 'changed', current_user, tenant.updated_at.to_i)
    end

    it "starts a GroupToSegmentJob" do
      expect{service.after_update(tenant, current_user)}.
        to have_enqueued_job(GroupToSegmentJob).with(tenant)
    end

  end

end
