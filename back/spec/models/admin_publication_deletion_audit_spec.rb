# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminPublicationDeletionAudit do
  describe 'scopes' do
    describe '.unreported' do
      it 'returns only rows that have not been reported yet' do
        unreported = create(:admin_publication_deletion_audit, reported_at: nil)
        create(:admin_publication_deletion_audit, reported_at: Time.zone.now)

        expect(described_class.unreported).to contain_exactly(unreported)
      end
    end

    describe '.recent' do
      it 'orders by deleted_at descending' do
        older = create(:admin_publication_deletion_audit, deleted_at: 2.days.ago)
        newer = create(:admin_publication_deletion_audit, deleted_at: 1.hour.ago)

        expect(described_class.recent.to_a).to eq([newer, older])
      end
    end
  end

  # The trigger is DEFERRABLE INITIALLY DEFERRED, so within a transactional test
  # it would only fire at COMMIT (which never happens). Forcing constraints to
  # IMMEDIATE runs the pending deferred trigger inside the current transaction so
  # we can observe its effect.
  describe 'the audit_orphaned_admin_publication trigger', :aggregate_failures do
    def flush_deferred_triggers!
      ActiveRecord::Base.connection.execute('SET CONSTRAINTS ALL IMMEDIATE')
    end

    # Deletes only the admin_publication row (bypassing ActiveRecord callbacks,
    # exactly like the out-of-band deletions we are hunting), leaving the
    # publication behind.
    def orphan!(admin_publication)
      AdminPublication.where(id: admin_publication.id).delete_all
      flush_deferred_triggers!
    end

    it 'records a row when a project is orphaned, and the project survives' do
      project = create(:project)
      admin_publication = project.admin_publication

      expect { orphan!(admin_publication) }.to change(described_class, :count).by(1)

      audit = described_class.last
      expect(audit).to have_attributes(
        admin_publication_id: admin_publication.id,
        publication_id: project.id,
        publication_type: 'Project'
      )
      expect(Project.find_by(id: project.id)).to be_present
    end

    it 'records a row when a folder is orphaned' do
      folder = create(:project_folder)

      expect { orphan!(folder.admin_publication) }.to change(described_class, :count).by(1)
      expect(described_class.last).to have_attributes(
        publication_id: folder.id,
        publication_type: 'ProjectFolders::Folder'
      )
    end

    it 'does NOT record a row for a legitimate project destroy (cascade)' do
      project = create(:project)

      expect do
        project.destroy!
        flush_deferred_triggers!
      end.not_to change(described_class, :count)
    end

    it 'does NOT record a row for a legitimate folder destroy (cascade)' do
      folder = create(:project_folder)

      expect do
        folder.destroy!
        flush_deferred_triggers!
      end.not_to change(described_class, :count)
    end

    it 'captures the tenant and the deleted row state' do
      project = create(:project)
      admin_publication = AdminPublication.find(project.admin_publication.id)

      orphan!(admin_publication)

      audit = described_class.last
      expect(audit.tenant_schema).to eq(Apartment::Tenant.current)
      expect(audit.tenant_host).to eq(Apartment::Tenant.current.tr('_', '.'))
      expect(audit.parent_id).to eq(admin_publication.parent_id)
      expect(audit.lft).to eq(admin_publication.lft)
      expect(audit.deleted_at).to be_present
    end
  end
end
