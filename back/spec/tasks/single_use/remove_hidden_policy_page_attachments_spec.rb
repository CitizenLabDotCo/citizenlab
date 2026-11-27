# frozen_string_literal: true

require 'rails_helper'

# Rename to *_spec.ignore.rb once the task has been released and run, per
# lib/tasks/single_use/README.md.
# rubocop:disable RSpec/DescribeClass
describe 'single_use:remove_hidden_policy_page_attachments' do
  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['single_use:remove_hidden_policy_page_attachments'] }

  after do
    task.reenable
    %w[
      remove_hidden_policy_page_attachments.json
      remove_hidden_policy_page_attachments_dry_run.json
    ].each { |file| FileUtils.rm_f(file) }
  end

  def attachment_on(code:, files_section_enabled:)
    page = create(:static_page, code: code, files_section_enabled: files_section_enabled)
    create(:file_attachment, attachable: page)
  end

  it 'reports a hidden attachment and removes nothing on a dry run' do
    attachment = attachment_on(code: 'privacy-policy', files_section_enabled: false)

    expect { task.invoke }.to output(/Deletes: 1/).to_stdout

    expect(Files::FileAttachment.exists?(attachment.id)).to be true
    report = JSON.parse(File.read('remove_hidden_policy_page_attachments_dry_run.json'))
    expect(report['deletes'].size).to eq 1
  end

  it 'removes the hidden attachments of the terms and privacy pages, and keeps their files' do
    privacy = attachment_on(code: 'privacy-policy', files_section_enabled: false)
    terms = attachment_on(code: 'terms-and-conditions', files_section_enabled: false)

    task.invoke('execute')

    expect(Files::FileAttachment.where(id: [privacy.id, terms.id])).to be_empty
    expect(Files::File.where(id: [privacy.file_id, terms.file_id]).count).to eq 2
  end

  it 'keeps attachments that the page shows' do
    shown = attachment_on(code: 'privacy-policy', files_section_enabled: true)

    task.invoke('execute')

    expect(Files::FileAttachment.exists?(shown.id)).to be true
  end

  # Builder pages show their files through file widgets, whatever the flag says.
  it 'leaves other pages alone' do
    custom = attachment_on(code: 'custom', files_section_enabled: false)

    task.invoke('execute')

    expect(Files::FileAttachment.exists?(custom.id)).to be true
  end
end
# rubocop:enable RSpec/DescribeClass
