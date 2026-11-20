# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Links::Resolver do
  subject(:resolver) { described_class.new(ref_map) }

  let(:ref_map) { DecidimImporter::RefMap.new }

  def register(model, attrs)
    ref_map.register(attrs['id'] || SecureRandom.uuid, DecidimImporter::Record.new(model, attrs))
  end

  describe '#content_href' do
    before { register('project', { 'title_multiloc' => { 'fr-FR' => 'P' }, 'slug' => 'bp2019' }) }

    it 'resolves a process link (with sub-path) to the matched project' do
      expect(resolver.content_href('https://participer.arcueil.fr/processes/bp2019/f/35/'))
        .to eq('/projects/bp2019')
    end

    it 'resolves a bare relative process link to the project' do
      expect(resolver.content_href('/processes/bp2019')).to eq('/projects/bp2019')
    end

    it 'resolves a link whose source slug was normalised on import' do
      register('project', { 'title_multiloc' => { 'fr-FR' => 'A' }, 'slug' => 'assemblee-citoyenne' })
      expect(resolver.content_href('/processes/Assemblee--Citoyenne/f/1')).to eq('/projects/assemblee-citoyenne')
    end

    it 'returns nil when no imported project has that slug' do
      expect(resolver.content_href('/processes/unknown/f/1')).to be_nil
    end

    it 'returns nil for a non-process path' do
      expect(resolver.content_href('/pages/about')).to be_nil
    end
  end

  describe '#file_id' do
    before do
      register('files/file', { 'id' => 'file-abc', 'name' => "Plan d'action.pdf" })
    end

    it 'resolves an Active Storage link to the imported file id by its (decoded) filename' do
      # The blob URL carries the percent-encoded filename; it matches the file whose name decodes to it.
      url = "https://participer.arcueil.fr/rails/active_storage/blobs/redirect/xyz/Plan%20d'action.pdf"
      expect(resolver.file_id(url)).to eq('file-abc')
    end

    it 'returns nil when no imported file matches the filename' do
      url = 'https://participer.arcueil.fr/rails/active_storage/blobs/redirect/xyz/Other.pdf'
      expect(resolver.file_id(url)).to be_nil
    end

    it 'keeps the first file when two share a name, staying deterministic' do
      register('files/file', { 'id' => 'file-def', 'name' => "Plan d'action.pdf" })
      url = "https://d/rails/active_storage/blobs/xyz/Plan%20d'action.pdf"
      expect(resolver.file_id(url)).to eq('file-abc')
    end

    context 'when the file is named after an attachment title that differs from its filename' do
      before do
        register('files/file', {
          'id' => 'file-proxy',
          'name' => 'Modèle de pouvoir.pdf',
          'remote_content_url' => 'https://d/rails/active_storage/blobs/redirect/sig1/Mod%C3%A8le%20pouvoir%20vote.pdf'
        })
      end

      it 'resolves a link by the filename of the file source URL' do
        # Same blob, but the description link may carry a different signed id.
        url = 'https://d/rails/active_storage/blobs/redirect/sig2/Mod%C3%A8le%20pouvoir%20vote.pdf'
        expect(resolver.file_id(url)).to eq('file-proxy')
      end

      it 'still resolves a link by the file name' do
        url = 'https://d/rails/active_storage/blobs/redirect/sig2/Mod%C3%A8le%20de%20pouvoir.pdf'
        expect(resolver.file_id(url)).to eq('file-proxy')
      end
    end

    it "prefers a file's name over another file's source filename" do
      register('files/file', {
        'id' => 'file-other',
        'name' => 'Synthèse.pdf',
        'remote_content_url' => "https://d/rails/active_storage/blobs/redirect/sig/Plan%20d'action.pdf"
      })
      url = "https://d/rails/active_storage/blobs/redirect/sig/Plan%20d'action.pdf"
      expect(resolver.file_id(url)).to eq('file-abc')
    end

    it 'keeps the first file when two share a source filename' do
      register('files/file', { 'id' => 'file-1', 'name' => 'A.pdf', 'remote_content_url' => 'https://d/x/s1/report.pdf' })
      register('files/file', { 'id' => 'file-2', 'name' => 'B.pdf', 'remote_content_url' => 'https://d/x/s2/report.pdf' })
      expect(resolver.file_id('https://d/rails/active_storage/blobs/redirect/s3/report.pdf')).to eq('file-1')
    end
  end
end
