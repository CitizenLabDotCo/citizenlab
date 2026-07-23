# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::MeetingAttachmentsExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'Espaces verts' } }) }
  let(:event) { DecidimImporter::Record.new('event', { 'title_multiloc' => { 'fr-FR' => 'Atelier' } }) }

  before do
    ref_map.register('decidim--process--2', project)
    ref_map.register('decidim--meetings--meeting--1', event)
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--attachment--500', 'title' => '{"fr":"Flyer"}', 'description' => '{"fr":"Le flyer"}',
      'weight' => '0', 'file' => 'http://example.org/files/redirect/flyer.pdf',
      'attached_to' => 'decidim--meetings--meeting--1', 'decidim_participatory_process' => 'decidim--process--2'
    }.merge(overrides)
  end

  it 'builds a file, a project-ownership join and an attachment on the event' do
    file = extract([row]).run.first

    expect(file.model_name).to eq('files/file')
    expect(file.attributes['name']).to eq('Flyer.pdf') # title + the URL's extension
    expect(file.attributes).not_to have_key('title_multiloc')
    expect(file.attributes['remote_content_url']).to eq('http://example.org/files/redirect/flyer.pdf')

    files_project = ref_map.fetch('decidim--attachment--500-files-project')
    expect(files_project.attributes['file_ref']).to be(file.attributes)
    expect(files_project.attributes['project_ref']).to be(project.attributes)

    attachment = ref_map.fetch('decidim--attachment--500-file-attachment')
    expect(attachment.model_name).to eq('files/file_attachment')
    expect(attachment.attributes['attachable_ref']).to be(event.attributes)
    expect(attachment.attributes['file_ref']).to be(file.attributes)
    expect(attachment.attributes['position']).to eq(0)
  end

  it 'skips an attachment whose meeting was not imported' do
    extractor = extract([row('attached_to' => 'decidim--meetings--meeting--999')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--attachment--500', reason: 'attached-to meeting not imported')
  end

  it 'skips an attachment with no file url' do
    extractor = extract([row('file' => '')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first[:reason]).to eq('attachment has no file url')
  end
end
