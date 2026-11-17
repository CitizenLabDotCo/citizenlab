# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:serve_stored_xml_files_as_downloads' do
  before do
    load_rake_tasks_if_not_loaded
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('AWS_REGION').and_return('eu-central-1')
    allow(ENV).to receive(:fetch).with('AWS_S3_BUCKET').and_return('uploads-bucket')
    allow(Aws::S3::Client).to receive(:new).and_return(s3)
    s3.stub_responses(:list_objects_v2, lambda { |context|
      prefix = context.params[:prefix]
      keys = objects.keys.select { |key| key.start_with?(prefix) }
      { contents: keys.map { |key| { key: key } }, is_truncated: false }
    })
    s3.stub_responses(:head_object, lambda { |context|
      response = objects.fetch(context.params[:key])
      raise response if response.is_a?(Exception)

      response
    })
  end

  after { task.reenable }

  # TenantScript writes its report to the working directory, so run in a throwaway one.
  around do |example|
    Dir.mktmpdir { |dir| Dir.chdir(dir) { example.run } }
  end

  let(:task) { Rake::Task['single_use:serve_stored_xml_files_as_downloads'] }
  let(:s3) { Aws::S3::Client.new(stub_responses: true) }
  let(:prefix) { "uploads/#{Tenant.current.id}" }
  let(:xml_key) { "#{prefix}/files/file/content/1/budget.csv" }
  let(:objects) do
    {
      xml_key => {
        content_type: 'application/xml',
        content_disposition: 'inline; filename="budget.csv"',
        cache_control: 'no-cache',
        metadata: { 'origin' => 'upload' }
      },
      "#{prefix}/idea_file/file/2/route.kml" => {
        content_type: 'application/vnd.google-earth.kml+xml',
        content_disposition: 'attachment; filename="route.kml"',
        cache_control: 'no-cache'
      },
      "#{prefix}/project_file/file/3/report.pdf" => {
        content_type: 'application/pdf',
        content_disposition: 'inline; filename="report.pdf"',
        cache_control: 'no-cache'
      }
    }
  end

  def copies
    s3.api_requests.select { |request| request[:operation_name] == :copy_object }.pluck(:params)
  end

  it 'serves the stored XML file as a download and keeps it readable' do
    task.invoke('execute')

    expect(copies).to contain_exactly(
      hash_including(
        bucket: 'uploads-bucket',
        key: xml_key,
        metadata_directive: 'REPLACE',
        metadata: { 'origin' => 'upload' },
        content_type: 'application/xml',
        cache_control: 'no-cache',
        content_disposition: 'attachment; filename="budget.csv"',
        acl: 'public-read'
      )
    )
  end

  it 'serves an XML file stored without a disposition as a download' do
    objects[xml_key].delete(:content_disposition)

    task.invoke('execute')

    expect(copies).to contain_exactly(hash_including(key: xml_key, content_disposition: 'attachment'))
  end

  it 'matches an inline disposition whatever its case' do
    objects[xml_key][:content_disposition] = 'Inline; filename="budget.csv"'

    task.invoke('execute')

    expect(copies).to contain_exactly(hash_including(key: xml_key, content_disposition: 'attachment; filename="budget.csv"'))
  end

  it 'reports a file it cannot read and still fixes the other files' do
    objects["#{prefix}/event_file/file/4/blocked.xml"] = 'Forbidden'

    task.invoke('execute')

    expect(copies).to contain_exactly(hash_including(key: xml_key))
    errors = JSON.parse(File.read('serve_stored_xml_files_as_downloads.json'))['errors']
    expect(errors).to contain_exactly(
      hash_including(
        'error' => start_with('Aws::S3::Errors::Forbidden'),
        'context' => hash_including('key' => "#{prefix}/event_file/file/4/blocked.xml")
      )
    )
  end

  it 'stops the tenant on an error that is not an S3 one' do
    objects["#{prefix}/event_file/file/5/broken.xml"] = RuntimeError.new('boom')

    task.invoke('execute')

    errors = JSON.parse(File.read('serve_stored_xml_files_as_downloads.json'))['errors']
    expect(errors).to contain_exactly(
      hash_including('error' => 'RuntimeError: boom', 'context' => { 'tenant' => Tenant.current.host })
    )
  end

  it 'changes nothing in a dry run' do
    task.invoke

    expect(copies).to be_empty
  end
end
# rubocop:enable RSpec/DescribeClass
