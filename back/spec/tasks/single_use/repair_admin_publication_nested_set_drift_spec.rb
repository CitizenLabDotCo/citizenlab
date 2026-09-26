# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
RSpec.describe 'single_use:repair_admin_publication_drift rake task' do
  before(:all) { load_rake_tasks_if_not_loaded } # rubocop:disable RSpec/BeforeAfterAll

  after do
    Rake::Task['single_use:repair_admin_publication_drift'].reenable
    FileUtils.rm_f(report_path)
  end

  let(:report_path) { Rails.root.join('repair_admin_publication_drift.json') }
  let(:integrity) { AdminPublications::NestedSetIntegrity }

  def run_task(execute: false)
    Rake::Task['single_use:repair_admin_publication_drift'].invoke(execute ? 'execute' : nil)
  end

  # Force `victim`'s bounds inside `folder`'s window while keeping it a root — the
  # exact drift found on production. Bypasses callbacks.
  def create_drift!
    folder = create(:project_folder)
    victim = create(:project)
    folder.admin_publication.update_columns(lft: 100, rgt: 200)
    victim.admin_publication.update_columns(lft: 150, rgt: 151, parent_id: nil)
  end

  context 'when a tenant has drift' do
    before { create_drift! }

    context 'in dry run mode' do
      it 'does not change the tree' do
        expect(integrity.drift_counts.first).to be > 0
        expect { run_task }.not_to(change { integrity.drift_counts.first })
      end

      it 'writes a report marking the change as not applied' do
        run_task
        change = JSON.parse(File.read(report_path))['changes'].first
        expect(change).to be_present
        expect(change.dig('context', 'applied')).to be(false)
      end
    end

    context 'in execute mode' do
      it 'repairs the drift and leaves the tree valid' do
        expect(integrity.drift_counts.first).to be > 0
        run_task(execute: true)
        expect(integrity.drift_counts.first).to eq(0)
        expect(AdminPublication.valid?).to be(true)
      end

      it 'writes a report marking the change as applied' do
        run_task(execute: true)
        change = JSON.parse(File.read(report_path))['changes'].first
        expect(change.dig('context', 'applied')).to be(true)
      end
    end
  end

  context 'when no tenant has drift' do
    it 'is a no-op and writes an empty changes report' do
      run_task(execute: true)
      expect(JSON.parse(File.read(report_path))['changes']).to be_empty
    end
  end
end
# rubocop:enable RSpec/DescribeClass
