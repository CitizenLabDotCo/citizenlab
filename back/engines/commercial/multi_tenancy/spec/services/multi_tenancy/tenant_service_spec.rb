# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultiTenancy::TenantService do
  subject(:service) { described_class.new(tenant_side_fx: tenant_side_fx) }

  let(:tenant_side_fx) { MultiTenancy::SideFxTenantService.new }

  describe '#shift_timestamps' do
    before do
      allow(Tenant.current).to receive_messages(active?: false, churned?: false)
    end

    it 'shifts timestamps that are more than 24 hours in the past' do
      user = create(:user, registration_completed_at: 3.days.ago)

      service.shift_timestamps(1)

      expect(user.reload.registration_completed_at).to be_within(5.seconds).of(2.days.ago)
    end

    it 'shifts timestamps that are in the future' do
      user = create(:user, registration_completed_at: 3.days.from_now)

      service.shift_timestamps(1)

      expect(user.reload.registration_completed_at).to be_within(5.seconds).of(4.days.from_now)
    end

    it 'does not shift timestamps that are less than 24 hours in the past' do
      original_time = 12.hours.ago
      user = create(:user, registration_completed_at: original_time)

      service.shift_timestamps(1)

      expect(user.reload.registration_completed_at).to be_within(5.seconds).of(original_time)
    end

    it 'maintains valid phase dates when one phase ends today and another starts tomorrow' do
      project = create(:project)
      phase1 = create(:phase, project: project, start_at: 10.days.ago.to_date, end_at: Time.zone.today)
      phase2 = create(:phase, project: project, start_at: Time.zone.tomorrow, end_at: 10.days.from_now.to_date)

      service.shift_timestamps(1)

      phase1.reload
      phase2.reload

      # Phase dates should remain valid (start_at <= end_at)
      expect(phase1.start_at).to be <= phase1.end_at
      expect(phase2.start_at).to be <= phase2.end_at

      # Phases should not overlap
      expect(phase1.end_at).to be < phase2.start_at
    end

    it 'maintains valid phase dates when one phase ended yesterday and another starts today' do
      project = create(:project)
      phase1 = create(:phase, project: project, start_at: 10.days.ago.to_date, end_at: Time.zone.yesterday)
      phase2 = create(:phase, project: project, start_at: Time.zone.today, end_at: 10.days.from_now.to_date)

      service.shift_timestamps(1)

      phase1.reload
      phase2.reload

      # Phase dates should remain valid (start_at <= end_at)
      expect(phase1.start_at).to be <= phase1.end_at
      expect(phase2.start_at).to be <= phase2.end_at

      # Phases should not overlap
      expect(phase1.end_at).to be < phase2.start_at
    end
  end

  describe '#delete' do
    let(:tenant) { Tenant.current }

    it "enqueues DeleteUserJob's and Tenant::DeleteJob" do
      nb_users = 3
      create_list(:user, nb_users)

      expect { service.delete(tenant) }
        .to  have_enqueued_job(DeleteUserJob).exactly(nb_users).times
        .and have_enqueued_job(MultiTenancy::Tenants::DeleteJob)
    end

    it 'runs before_destroy side effects' do
      expect(tenant_side_fx).to receive(:before_destroy).with(tenant)
      service.delete(tenant)
    end

    it 'marks the tenant as deleted' do
      service.delete(tenant)
      expect(tenant.deleted_at).not_to be_nil
    end
  end
end
