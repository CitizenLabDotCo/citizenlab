require "rails_helper"

describe SideFxParticipationContextService do
  let(:permissions_service) { instance_double(PermissionsService) }
  let(:service) { SideFxParticipationContextService.new(permissions_service) }
  let(:user) { create(:user) }
  let(:pc) { create(:continuous_project) }


  describe "after_create" do
    it "performs the necessary side fx" do
      expect(permissions_service).to receive(:update_permissions_for_context).with(pc)
      expect {service.after_create(pc, user)}.
        to have_enqueued_job(Surveys::WebhookManagerJob)
    end
  end

  describe "after_update" do
    it "performs the necessary side fx" do
      expect(permissions_service).to receive(:update_permissions_for_context).with(pc)
      expect {service.after_update(pc, user)}.
        to have_enqueued_job(Surveys::WebhookManagerJob)
    end
  end

  describe "before_destroy" do
    it "performs the necessary side fx" do
      expect {service.before_destroy(pc, user)}.
        to have_enqueued_job(Surveys::WebhookManagerJob)
    end
  end

end
