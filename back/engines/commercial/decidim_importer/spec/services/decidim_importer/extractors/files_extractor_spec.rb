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
      'title' => '{"fr":"Compte-rendu"}', 'weight' => '2',
      'file' => "http://example.org/files/redirect/abc/Plan%20d'actions.pdf"
    }.merge(overrides)
  end

  it 'builds a project file referencing the project, with the decoded URL basename as its name' do
    file = extract([row]).first

    expect(file.model_name).to eq('project_file')
    attrs = file.attributes
    expect(attrs['name']).to eq("Plan d'actions.pdf") # percent-decoded basename, extension preserved
    expect(attrs['ordering']).to eq(2)
    expect(attrs['remote_file_url']).to eq("http://example.org/files/redirect/abc/Plan%20d'actions.pdf")
    expect(attrs['project_ref']).to be(project.attributes)
  end

  it 'registers the file under its attachment uid' do
    file = extract([row]).first
    expect(ref_map.fetch('decidim-attachment-1')).to be(file)
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
