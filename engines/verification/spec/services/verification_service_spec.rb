require "rails_helper"

describe Verification::VerificationService do
  let(:sfxv_service) { instance_double(Verification::SideFxVerificationService) }
  let(:service) { Verification::VerificationService.new sfxv_service }

  describe "verify_sync" do
    let(:user) { create(:user) }

    it "executes side fx hooks" do
      params = {
        user: user,
        method_name: 'cow',
        verification_parameters: {run: "12.025.365-6", id_serial: "A001529382"}
      }

      expect(sfxv_service)
        .to receive(:before_create)
        .with(instance_of(Verification::Verification), user)

      expect(sfxv_service)
        .to receive(:after_create)
        .with(instance_of(Verification::Verification), user)

      service.verify_sync(params)
    end

    it "Adds a verification" do
      allow(sfxv_service).to receive(:before_create)
      allow(sfxv_service).to receive(:after_create)

      params = {
        user: user,
        method_name: 'cow',
        verification_parameters: {run: "12.025.365-6", id_serial: "A001529382"}
      }

      expect(Verification::Verification.count).to eq 0

      service.verify_sync(params)

      expect(Verification::Verification.count).to eq 1
      expect(Verification::Verification.first).to have_attributes({
        user_id: user.id,
        method_name: 'cow',
        hashed_uid: '7c18cce107584e83c4e3a5d5ed336134dd3844bf0b5fcfd7c82a9877709a2654',
        active: true
      })
    end

    it "raises a VerificationTakenError when another user verified with that identity" do
      allow(sfxv_service).to receive(:before_create)
      allow(sfxv_service).to receive(:after_create)

      params1 = {
        user: create(:user),
        method_name: 'cow',
        verification_parameters: {run: "12.025.365-6", id_serial: "A001529382"}
      }
      service.verify_sync(params1)

      params2 = {
        user: user,
        method_name: 'cow',
        verification_parameters: {run: "12.025.365-6", id_serial: "A001529382"}
      }

      expect{service.verify_sync(params2)}.to raise_error(Verification::VerificationService::VerificationTakenError)
    end

  end

end
