# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::ProposalAttachmentsExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:process_uid) { 'decidim--participatory-process--10' }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } }) }
  let(:idea) { DecidimImporter::Record.new('idea', { 'title_multiloc' => { 'fr-FR' => 'I' } }) }

  before do
    ref_map.register(process_uid, project)
    ref_map.register('decidim--proposals--proposal--195', idea)
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--attachment--233', 'decidim_participatory_process' => process_uid,
      'attached_to' => 'decidim--proposals--proposal--195',
      'title' => '{"fr":"images-1.jpg"}', 'description' => '{"fr":"une image"}', 'weight' => '2',
      'file' => 'https://participer.arcueil.fr/rails/active_storage/blobs/redirect/xyz/images%201.jpg'
    }.merge(overrides)
  end

  it 'builds a Files::File with the decoded URL basename as name and the Decidim title/description' do
    file = extract([row]).first

    expect(file.model_name).to eq('files/file')
    attrs = file.attributes
    expect(attrs['name']).to eq('images 1.jpg') # percent-decoded basename
    expect(attrs['title_multiloc']).to eq('fr-FR' => 'images-1.jpg')
    expect(attrs['description_multiloc']).to eq('fr-FR' => 'une image')
    expect(attrs['remote_content_url']).to eq(row['file'])
  end

  it 'attaches the file to the idea (file_attachment) and owns it in the idea’s project (files_project)' do
    file = extract([row]).first

    join = ref_map.fetch('decidim--attachment--233-files-project')
    expect(join.model_name).to eq('files/files_project')
    expect(join.attributes['file_ref']).to be(file.attributes)
    expect(join.attributes['project_ref']).to be(project.attributes)

    attachment = ref_map.fetch('decidim--attachment--233-file-attachment')
    expect(attachment.model_name).to eq('files/file_attachment')
    expect(attachment.attributes['file_ref']).to be(file.attributes)
    expect(attachment.attributes['attachable_ref']).to be(idea.attributes)
    expect(attachment.attributes['position']).to eq(2)
  end

  it 'skips an attachment whose proposal was not imported' do
    extractor = described_class.new(
      [row('attached_to' => 'decidim--proposals--proposal--999')], ref_map, locale_mapper: mapper, primary_locale: 'fr-FR'
    )
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--attachment--233', reason: 'attached-to proposal not imported')
  end

  it 'skips an attachment with no file URL' do
    extractor = described_class.new([row('file' => '')], ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--attachment--233', reason: 'attachment has no file url')
  end
end
