# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:remove_pending_reviews_for_published_projects rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task[task_name].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(dry_run_report_path)
  end

  let(:task_name) { 'single_use:remove_pending_reviews_for_published_projects' }
  let(:report_path) { Rails.root.join('remove_pending_reviews_for_published_projects.json') }
  let(:dry_run_report_path) do
    Rails.root.join('remove_pending_reviews_for_published_projects_dry_run.json')
  end

  let(:project) { create(:project) }
  let!(:review) { create(:project_review, project: project, approved_at: nil) }

  # The task writes only when passed 'execute', so most examples want it; `dry_run: true` drops it.
  def run_task(dry_run: false, host: nil)
    Rake::Task[task_name].invoke(dry_run ? nil : 'execute', host)
  end

  def report(path = report_path)
    JSON.parse(File.read(path))
  end

  context 'when a published project has a pending review' do
    before do
      project.admin_publication.update!(publication_status: 'published')
    end

    it 'deletes it' do
      run_task
      expect(ProjectReview.where(id: review.id)).not_to exist
    end

    it 'records the deletion in the report' do
      run_task
      delete = report['deletes'].first
      expect(delete['model_name']).to eq 'ProjectReview'
      expect(delete['id']).to eq review.id
      expect(delete['context']).to include('tenant' => Tenant.current.host, 'project_id' => project.id)
    end

    it 'leaves it in place on a dry run, but still reports it' do
      run_task(dry_run: true)
      expect(ProjectReview.where(id: review.id)).to exist
      expect(report(dry_run_report_path)['deletes'].first['id']).to eq review.id
    end
  end

  context 'when a project has an approved review' do
    let!(:review) { create(:project_review, :approved, project: project) }

    it 'leaves it alone' do
      run_task
      expect(ProjectReview.where(id: review.id)).to exist
      expect(report['deletes']).to be_empty
    end
  end
end
# rubocop:enable RSpec/DescribeClass
