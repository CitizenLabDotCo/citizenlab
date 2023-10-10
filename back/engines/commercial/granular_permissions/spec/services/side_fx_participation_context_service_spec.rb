# frozen_string_literal: true

require 'rails_helper'

describe SideFxParticipationContextService do
  subject(:service) do
    described_class.new.tap { |s| s.permissions_service = permissions_service }
  end

  let(:permissions_service) { instance_double(PermissionsService) }
  let(:user) { create(:user) }
  let(:pc) { create(:continuous_project) }

  describe 'after_create' do
    specify do
      expect(permissions_service).to receive(:update_permissions_for_scope).with(pc)
      service.after_create(pc, user)
    end
  end

  describe 'after_update' do
    specify do
      expect(permissions_service).to receive(:update_permissions_for_scope).with(pc)
      service.after_update(pc, user)
    end
  end
end
