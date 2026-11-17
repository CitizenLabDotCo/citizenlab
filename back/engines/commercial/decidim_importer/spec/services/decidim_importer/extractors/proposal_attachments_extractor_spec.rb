# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::ProposalAttachmentsExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:process_uid) { 'decidim--participatory-process--10' }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } }) }
  # A real idea references its project (ProposalsExtractor does `idea.reference('project', project)`).
  let(:idea) do
    DecidimImporter::Record.new('idea', { 'title_multiloc' => { 'fr-FR' => 'I' } })
      .tap { |i| i.reference('project', project) }
  end

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
      'title' => '{"fr":"plan-1.pdf"}', 'description' => '{"fr":"un plan"}', 'weight' => '2',
      'file' => 'https://participer.arcueil.fr/rails/active_storage/blobs/redirect/xyz/plan%201.pdf'
    }.merge(overrides)
  end

  it 'names the Files::File from the title (extension not doubled), sets the description, and no title_multiloc' do
    file = extract([row]).first

    expect(file.model_name).to eq('files/file')
    attrs = file.attributes
    # The title already ends in `.pdf` (as does the URL), so the extension isn't appended twice.
    expect(attrs['name']).to eq('plan-1.pdf')
    expect(attrs).not_to have_key('title_multiloc')
    expect(attrs['description_multiloc']).to eq('fr-FR' => 'un plan')
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

  describe 'card photo' do
    let(:photo_url) { 'https://participer.arcueil.fr/rails/active_storage/blobs/redirect/abc/photo%201.jpeg' }

    def attachment(uid, weight, file, content_type = nil)
      row('uid' => uid, 'weight' => weight.to_s, 'file' => file, 'title' => '', 'content_type' => content_type)
    end

    def idea_images
      ref_map.records.select { |r| r.model_name == 'idea_image' }
    end

    it "makes the proposal's lowest-weight photo the idea image, and keeps every attachment as a file" do
      extract([
        attachment('decidim--attachment--1', 3, row['file'], 'application/pdf'),
        attachment('decidim--attachment--2', 5, 'https://x.test/second.png', 'image/png'),
        attachment('decidim--attachment--3', 4, photo_url, 'image/jpeg')
      ])

      expect(idea_images.size).to eq(1)
      image = idea_images.first.attributes
      expect(image).to include('remote_image_url' => photo_url, 'ordering' => 0)
      expect(image['idea_ref']).to be(idea.attributes)
      expect(ref_map.records.select { |r| r.model_name == 'files/file' }.map { |r| r.attributes['remote_content_url'] })
        .to contain_exactly(row['file'], 'https://x.test/second.png', photo_url)
      expect(ref_map.fetch('decidim--attachment--3-file-attachment')).to be_present
    end

    it 'picks one photo per proposal' do
      other_idea = DecidimImporter::Record.new('idea', {}).tap { |i| i.reference('project', project) }
      ref_map.register('decidim--proposals--proposal--196', other_idea)

      extract([
        attachment('decidim--attachment--1', 1, photo_url),
        row('uid' => 'decidim--attachment--2', 'weight' => '1', 'file' => 'https://x.test/b.jpg',
          'attached_to' => 'decidim--proposals--proposal--196')
      ])

      expect(idea_images.map { |i| i.attributes['idea_ref'] }).to contain_exactly(idea.attributes, other_idea.attributes)
    end

    context 'when deciding what is a photo' do
      using RSpec::Parameterized::TableSyntax

      where(:file, :content_type, :photo) do
        'https://x.test/a.jpeg' | 'image/jpeg'      | true
        'https://x.test/a.jpeg' | nil               | true  # export without the content type column
        'https://x.test/a.pdf'  | nil               | false
        'https://x.test/a.jpeg' | 'application/pdf' | false
        'https://x.test/a.heic' | 'image/heic'      | false # IdeaImage doesn't accept the format
      end

      with_them do
        it 'makes it the idea image only when it is a photo' do
          extract([attachment('decidim--attachment--1', 1, file, content_type)])

          expect(idea_images.size).to eq(photo ? 1 : 0)
          expect(ref_map.fetch('decidim--attachment--1').model_name).to eq('files/file')
        end
      end
    end
  end
end
