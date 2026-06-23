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
      'title' => '{"fr":"Compte-rendu"}', 'description' => '{"fr":"Notes de réunion"}', 'weight' => '2',
      'file' => "http://example.org/files/redirect/abc/Plan%20d'actions.pdf"
    }.merge(overrides)
  end

  it 'builds a Files::File with the decoded URL basename as name and the Decidim title/description' do
    file = extract([row]).first

    expect(file.model_name).to eq('files/file')
    attrs = file.attributes
    expect(attrs['name']).to eq("Plan d'actions.pdf") # percent-decoded basename, extension preserved
    expect(attrs['title_multiloc']).to eq('fr-FR' => 'Compte-rendu')
    expect(attrs['description_multiloc']).to eq('fr-FR' => 'Notes de réunion')
    expect(attrs['remote_content_url']).to eq("http://example.org/files/redirect/abc/Plan%20d'actions.pdf")
  end

  it 'registers a files_project ownership join linking the file to its project' do
    file = extract([row]).first
    join = ref_map.fetch('decidim-attachment-1-files-project')

    expect(join.model_name).to eq('files/files_project')
    expect(join.attributes['file_ref']).to be(file.attributes)
    expect(join.attributes['project_ref']).to be(project.attributes)
  end

  it 'registers a file_attachment on the project, with the weight as its position' do
    file = extract([row]).first
    attachment = ref_map.fetch('decidim-attachment-1-file-attachment')

    expect(attachment.model_name).to eq('files/file_attachment')
    expect(attachment.attributes['file_ref']).to be(file.attributes)
    expect(attachment.attributes['attachable_ref']).to be(project.attributes)
    expect(attachment.attributes['position']).to eq(2)
  end

  it 'falls back to the attachment title when the URL has no usable filename' do
    attrs = extract([row('file' => 'http://example.org/')]).first.attributes
    expect(attrs['name']).to eq('Compte-rendu')
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
