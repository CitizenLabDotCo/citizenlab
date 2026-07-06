# frozen_string_literal: true

require 'rails_helper'

# TAN-8089. Covers the nested-set drift that orphans publications and the destroy
# guard that prevents it.
#
# Mechanism: AdminPublication is `acts_as_nested_set dependent: :destroy` with no
# :scope, so the cascade deletes descendants by the lft/rgt window, not parent_id.
# When bounds drift out of sync with parent_id, a normal destroy deletes an
# unrelated publication's node, leaving it orphaned.
RSpec.describe AdminPublications::NestedSetIntegrity do
  # Force `victim`'s bounds inside `folder`'s window while keeping it a root
  # (parent_id = nil) — the exact drift found on production. Bypasses callbacks.
  def drift_victim_into(folder, victim)
    folder.admin_publication.update_columns(lft: 100, rgt: 200)
    victim.admin_publication.update_columns(lft: 150, rgt: 151, parent_id: nil)
  end

  describe 'the bug it defends against (guard disabled)' do
    it 'orphans an unrelated project when a drifted folder is destroyed' do
      folder = create(:project_folder)
      victim = create(:project)
      drift_victim_into(folder, victim)
      victim_ap_id = victim.admin_publication.id

      allow(described_class).to receive(:guard_destroy!) # disable the guard

      folder.destroy!

      expect(AdminPublication.exists?(victim_ap_id)).to be(false) # cascade wiped it
      expect(Project.exists?(victim.id)).to be(true)
      expect(victim.reload.admin_publication).to be_nil # orphaned
    end
  end

  describe '.node_drifted?' do
    it 'is false for a healthy folder + children' do
      folder = create(:project_folder, projects: [create(:project)])
      # The factory sets the child's parent_id via a bare update without a
      # nested-set move, so bounds don't encompass the child until rebuilt.
      AdminPublication.rebuild!(false) # false = skip per-node validations while rewriting bounds
      expect(described_class.node_drifted?(folder.reload.admin_publication)).to be(false)
    end

    it 'is true when an unrelated node has drifted into the window' do
      folder = create(:project_folder)
      victim = create(:project)
      drift_victim_into(folder, victim)
      expect(described_class.node_drifted?(folder.reload.admin_publication)).to be(true)
    end
  end

  describe '.guard_destroy! via the destroy callback' do
    it 'repairs the tree and destroys the folder WITHOUT orphaning the unrelated project' do
      folder = create(:project_folder)
      victim = create(:project)
      drift_victim_into(folder, victim)
      victim_ap_id = victim.admin_publication.id

      expect(ErrorReporter).to receive(:report_msg).with(/drift detected/, anything)

      folder.destroy! # guard runs first -> rebuild -> safe cascade

      expect(ProjectFolders::Folder.exists?(folder.id)).to be(false) # folder gone (legitimately)
      expect(AdminPublication.exists?(victim_ap_id)).to be(true)     # victim node survived
      expect(victim.reload.admin_publication).to be_present
    end

    it 'raises rather than orphaning when the tree cannot be reconciled' do
      folder = create(:project_folder)
      victim = create(:project)
      drift_victim_into(folder, victim)

      # Simulate an unfixable tree: the rebuild leaves the drift in place.
      allow(described_class).to receive(:rebuild_locked!)
      allow(ErrorReporter).to receive(:report_msg)

      expect { folder.destroy! }.to raise_error(described_class::DriftError)
      expect(victim.reload.admin_publication).to be_present # not orphaned
    end
  end

  describe '.repair!' do
    it 'clears drift and reports the tree valid' do
      folder = create(:project_folder)
      victim = create(:project)
      drift_victim_into(folder, victim)

      expect(described_class.drift_counts.first).to be > 0
      expect(described_class.repair!).to be(true)
      expect(described_class.drift_counts.first).to eq(0)
    end
  end
end
