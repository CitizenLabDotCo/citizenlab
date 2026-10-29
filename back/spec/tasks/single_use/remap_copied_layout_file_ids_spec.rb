# frozen_string_literal: true

require 'rails_helper'

# Rename to *_spec.ignore.rb once the task has been released and run, per
# lib/tasks/single_use/README.md.
# rubocop:disable RSpec/DescribeClass
describe 'single_use:remap_copied_layout_file_ids' do
  before { load_rake_tasks_if_not_loaded }

  after do
    task.reenable
    %w[remap_copied_layout_file_ids.json remap_copied_layout_file_ids_dry_run.json].each { |file| FileUtils.rm_f(file) }
  end

  let(:task) { Rake::Task['single_use:remap_copied_layout_file_ids'] }
  let(:source_project) { create(:project) }
  let(:project) { create(:project) }
  let(:source_file) { create(:file, name: 'agenda.pdf', projects: [source_project]) }
  let!(:project_file) { create(:file, name: 'agenda.pdf', size: source_file.size, projects: [project]) }
  let!(:layout) do
    create(:layout, content_buildable: project, code: 'project_page', craftjs_json: {
      'ROOT' => { 'type' => { 'resolvedName' => 'Container' }, 'nodes' => ['file1'] },
      'file1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => source_file.id } }
    })
  end

  it 'points the widget at the project file with the same name and size' do
    task.invoke('execute')

    expect(layout.reload.referenced_file_ids).to eq [project_file.id]
    expect(layout.file_attachments.pluck(:file_id)).to eq [project_file.id]
  end

  it 'changes nothing on a dry run' do
    expect { task.invoke }.not_to(change { layout.reload.craftjs_json })
  end

  it 'leaves the widget alone when the project has no matching file' do
    project_file.update!(name: 'other.pdf')

    expect { task.invoke('execute') }.not_to(change { layout.reload.craftjs_json })
  end

  it 'leaves the widget alone when the file belongs to no project' do
    source_file.files_projects.destroy_all

    expect { task.invoke('execute') }.not_to(change { layout.reload.craftjs_json })
  end

  it 'leaves the widget alone when the file size is unknown' do
    [source_file, project_file].each { |file| file.update_column(:size, nil) }

    expect { task.invoke('execute') }.not_to(change { layout.reload.craftjs_json })
  end

  it 'leaves the widget alone when the project has several matching files' do
    create(:file, name: 'agenda.pdf', size: source_file.size, projects: [project])

    expect { task.invoke('execute') }.not_to(change { layout.reload.craftjs_json })
  end
end
# rubocop:enable RSpec/DescribeClass
