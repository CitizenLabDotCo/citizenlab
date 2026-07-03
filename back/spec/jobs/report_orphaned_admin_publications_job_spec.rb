# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportOrphanedAdminPublicationsJob do
  subject(:job) { described_class.new }

  let(:tenant) { Tenant.current }

  # Yield the current tenant without an actual schema switch: the spec already
  # runs inside that tenant's schema, where the audit rows are created.
  before { allow(Tenant).to receive(:safe_switch_each).and_yield(tenant) }

  it 'reports each unreported audit row to Sentry and stamps reported_at' do
    audit = create(:admin_publication_deletion_audit, reported_at: nil)

    expect(ErrorReporter).to receive(:report_msg).once.with(
      a_string_including('Orphaned admin_publication captured'),
      extra: hash_including(
        audit_id: audit.id,
        publication_id: audit.publication_id,
        publication_type: audit.publication_type,
        tenant_host: tenant.host
      )
    )

    expect { job.perform }.to change { audit.reload.reported_at }.from(nil).to(be_present)
  end

  it 'is idempotent: already-reported rows are not reported again' do
    create(:admin_publication_deletion_audit, reported_at: Time.zone.now)

    expect(ErrorReporter).not_to receive(:report_msg)

    job.perform
  end

  it 'reports nothing when there are no captured rows' do
    expect(ErrorReporter).not_to receive(:report_msg)

    expect { job.perform }.not_to raise_error
  end
end
