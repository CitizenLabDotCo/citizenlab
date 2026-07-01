# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::ImportLinkResolver do
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

    it 'returns nil when no imported project has that slug' do
      expect(resolver.content_href('/processes/unknown/f/1')).to be_nil
    end

    it 'returns nil for a non-process path' do
      expect(resolver.content_href('/pages/about')).to be_nil
    end
  end

  describe '#file_href' do
    before do
      register('files/file', { 'id' => 'file-abc', 'name' => "Plan d'action.pdf" })
    end

    it 'resolves an Active Storage link to the imported file by its (decoded) filename' do
      # The blob URL carries the percent-encoded filename; it matches the file whose name decodes to it.
      url = "https://participer.arcueil.fr/rails/active_storage/blobs/redirect/xyz/Plan%20d'action.pdf"
      expect(resolver.file_href(url))
        .to eq('/uploads/files/file/content/file-abc/Plan_d_action.pdf') # spaces/apostrophes sanitised
    end

    it 'returns nil when no imported file matches the filename' do
      url = 'https://participer.arcueil.fr/rails/active_storage/blobs/redirect/xyz/Other.pdf'
      expect(resolver.file_href(url)).to be_nil
    end

    it 'keeps the first file when two share a name, staying deterministic' do
      register('files/file', { 'id' => 'file-def', 'name' => "Plan d'action.pdf" })
      url = "https://d/rails/active_storage/blobs/xyz/Plan%20d'action.pdf"
      expect(resolver.file_href(url)).to eq('/uploads/files/file/content/file-abc/Plan_d_action.pdf')
    end
  end
end
