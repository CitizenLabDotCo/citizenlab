# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultiTenancy::ApplyTenantTemplateJob do
  let(:tenant) { Tenant.current }
  let(:apply_service) { instance_double(MultiTenancy::Templates::ApplyService, apply: nil) }

  before do
    allow(MultiTenancy::Templates::ApplyService).to receive(:new).and_return(apply_service)
    # Skip the heavy finalization (campaigns/permissions/tracking).
    allow(MultiTenancy::TenantService).to receive(:new)
      .and_return(instance_double(MultiTenancy::TenantService, finalize_creation: true))
  end

  describe '#perform_now' do
    context 'when the template has not been applied yet' do
      it 'marks the tenant and applies the template' do
        freeze_time do
          described_class.perform_now('base', tenant)
          expect(tenant.reload.template_application_started_at).to eq(Time.zone.now)
        end

        expect(apply_service).to have_received(:apply).with('base')
      end

      it 'keeps the mark when applying the template fails' do
        allow(apply_service).to receive(:apply).and_raise(RuntimeError)

        expect { described_class.perform_now('base', tenant) }
          .to raise_error(RuntimeError)
          .and have_enqueued_job(LogActivityJob).with(tenant, 'creation_failed', any_args)

        expect(tenant.reload.template_application_started_at).to be_present
      end
    end

    context 'when the template application already started (interrupted run)' do
      before do
        tenant.update!(template_application_started_at: 1.hour.ago)
        allow(ErrorReporter).to receive(:report_msg)
      end

      it 'does not apply the template again' do
        expect { described_class.perform_now('base', tenant) }
          .not_to have_enqueued_job(LogActivityJob).with(tenant, 'loading_template', any_args)

        expect(apply_service).not_to have_received(:apply)
      end

      it 'reports the creation as failed' do
        expect { described_class.perform_now('base', tenant) }
          .to have_enqueued_job(LogActivityJob).with(
            tenant, 'creation_failed', nil, kind_of(Integer),
            payload: { error_message: a_string_including('interrupted') }
          )

        expect(ErrorReporter).to have_received(:report_msg)
          .with(a_string_including('interrupted'), extra: hash_including(tenant_id: tenant.id))
      end
    end
  end
end
