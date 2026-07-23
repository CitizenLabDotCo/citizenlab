# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::FilesExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:process_uid) { 'decidim-process-1' }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } }) }

  before { ref_map.register(process_uid, project) }

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run
  end

  def row(overrides = {})
    {
      'uid' => 'decidim-attachment-1', 'decidim_participatory_process' => process_uid,
      'title' => '{"fr":"Compte-rendu"}', 'description' => '{"fr":"Notes de réunion"}',
      'file' => "http://example.org/files/redirect/abc/Plan%20d'actions.pdf"
    }.merge(overrides)
  end

  it 'names the Files::File from the title + the URL extension, sets the description, and no title_multiloc' do
    file = extract([row]).first

    expect(file.model_name).to eq('files/file')
    attrs = file.attributes
    expect(attrs['name']).to eq('Compte-rendu.pdf') # title + the URL's file extension
    expect(attrs).not_to have_key('title_multiloc')
    expect(attrs['description_multiloc']).to eq('fr-FR' => 'Notes de réunion')
    expect(attrs['remote_content_url']).to eq("http://example.org/files/redirect/abc/Plan%20d'actions.pdf")
  end

  it 'uses the title alone when the URL carries no extension' do
    attrs = extract([row('file' => 'http://example.org/files/redirect/abc')]).first.attributes
    expect(attrs['name']).to eq('Compte-rendu')
  end

  it 'registers a files_project ownership join linking the file to its project' do
    file = extract([row]).first
    join = ref_map.fetch('decidim-attachment-1-files-project')

    expect(join.model_name).to eq('files/files_project')
    expect(join.attributes['file_ref']).to be(file.attributes)
    expect(join.attributes['project_ref']).to be(project.attributes)
  end

  it 'does not surface the file as a project attachment' do
    extract([row])
    # The file is available via the files_project join and linked from the description, but is not
    # attached to the project (no Files::FileAttachment with the project as attachable).
    file_attachments = ref_map.records.select { |r| r.model_name == 'files/file_attachment' }
    expect(file_attachments).to be_empty
  end

  it 'falls back to the decoded URL basename when the attachment has no title' do
    attrs = extract([row('title' => '')]).first.attributes
    expect(attrs['name']).to eq("Plan d'actions.pdf")
  end

  it 'skips an attachment with no file URL' do
    extractor = described_class.new([row('file' => '')], ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim-attachment-1', reason: 'attachment has no file url')
  end

  it 'skips an attachment whose owning process was not imported as a project' do
    extractor = described_class.new(
      [row('decidim_participatory_process' => 'missing')], ref_map, locale_mapper: mapper, primary_locale: 'fr-FR'
    )
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim-attachment-1', reason: 'no project for attachment')
  end
end
