# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:remove_project_images_with_empty_image_column rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task[task_name].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(dry_run_report_path)
  end

  let(:task_name) { 'single_use:remove_project_images_with_empty_image_column' }
  let(:report_path) { Rails.root.join('remove_project_images_with_empty_image_column.json') }
  let(:dry_run_report_path) do
    Rails.root.join('remove_project_images_with_empty_image_column_dry_run.json')
  end
  let(:project) { create(:project) }

  # The task writes only when passed 'execute', so most examples want it; `dry_run: true` drops it.
  def run_task(dry_run: false, host: nil)
    Rake::Task[task_name].invoke(dry_run ? nil : 'execute', host)
  end

  def report(path = report_path)
    JSON.parse(File.read(path))
  end

  # The model now requires an image, so this state can only be written past validation — which is
  # how the rows this task cleans up came to exist in the first place.
  def empty_image!(project_image, value = nil)
    project_image.update_column(:image, value)
    project_image
  end

  context 'when a project image has no stored image' do
    let!(:project_image) { empty_image!(create(:project_image, project: project)) }

    it 'deletes it' do
      run_task
      expect(ProjectImage.where(id: project_image.id)).not_to exist
    end

    it 'records the deletion in the report' do
      run_task
      delete = report['deletes'].first
      expect(delete['model_name']).to eq 'ProjectImage'
      expect(delete['id']).to eq project_image.id
      expect(delete['context']).to include('tenant' => Tenant.current.host)
    end

    it 'leaves it in place on a dry run, but still reports it' do
      run_task(dry_run: true)
      expect(ProjectImage.where(id: project_image.id)).to exist
      expect(report(dry_run_report_path)['deletes'].first['id']).to eq project_image.id
    end
  end

  context 'when the image column holds an empty string' do
    let!(:project_image) { empty_image!(create(:project_image, project: project), '') }

    it 'deletes it' do
      run_task
      expect(ProjectImage.where(id: project_image.id)).not_to exist
    end
  end

  context 'when a project image has a stored image' do
    let!(:project_image) { create(:project_image, project: project) }

    it 'leaves it alone' do
      run_task
      expect(ProjectImage.where(id: project_image.id)).to exist
      expect(report['deletes']).to be_empty
    end
  end
end
# rubocop:enable RSpec/DescribeClass
