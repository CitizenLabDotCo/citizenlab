# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:delete_project_description_layouts rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['single_use:delete_project_description_layouts'].reenable
    FileUtils.rm_f(report_path)
    FileUtils.rm_f(dry_run_report_path)
  end

  let(:report_path) { Rails.root.join('delete_project_description_layouts.json') }
  let(:dry_run_report_path) { Rails.root.join('delete_project_description_layouts_dry_run.json') }
  let(:project) { create(:project) }
  let!(:description_layout) do
    create(:layout, content_buildable: project, code: 'project_description', enabled: true)
  end

  def run_task(dry_run: false)
    Rake::Task['single_use:delete_project_description_layouts'].invoke(dry_run ? nil : 'execute', nil)
  end

  it 'deletes the superseded project_description layout' do
    run_task

    expect(ContentBuilder::Layout.where(id: description_layout.id)).to be_empty
  end

  it 'leaves the project page layout alone' do
    page = create(:layout, content_buildable: project, code: 'project_page', enabled: true)

    run_task

    expect(page.reload).to be_present
  end

  it 'leaves a folder description layout alone' do
    folder_layout = create(:layout, content_buildable: create(:project_folder), code: 'project_folder_description')

    run_task

    expect(folder_layout.reload).to be_present
  end

  # The migrated bridge widgets on the project page still reference these by text_reference.
  it 'keeps the project text images' do
    text_image = create(:text_image, imageable: project)

    run_task

    expect(text_image.reload).to be_present
  end

  it 'writes nothing on a dry run' do
    run_task(dry_run: true)

    expect(description_layout.reload).to be_present
    expect(JSON.parse(File.read(dry_run_report_path))['deletes'].size).to eq 1
  end
end
# rubocop:enable RSpec/DescribeClass
