# frozen_string_literal: true

require 'rails_helper'

# Decidim rich text carries root-relative embedded-image srcs (`<img src="/rails/active_storage/…">`).
# Go Vocal's rich-text image handler can't download a host-less src (empty URI scheme aborts the whole
# import), so the importer makes them absolute at dump time and drops any that still aren't fetchable.
RSpec.describe DecidimImporter::Importer do
  describe '#absolutize_embedded_images!' do
    subject(:importer) { described_class.new({ projects: [{ 'url' => 'https://arcueil.fr/processes/x' }] }) }

    def register(model, attributes)
      record = DecidimImporter::Record.new(model, attributes)
      importer.ref_map.register("#{model}-1", record)
      record
    end

    it 'makes a root-relative img src absolute on the source domain, in a multiloc' do
      record = register('phase', { 'description_multiloc' => { 'fr-FR' => '<p><img src="/rails/blobs/a/Logo.png" alt="L"></p>' } })

      importer.send(:absolutize_embedded_images!)

      expect(record.attributes['description_multiloc']['fr-FR'])
        .to include('src="https://arcueil.fr/rails/blobs/a/Logo.png"')
    end

    it 'makes a root-relative img src absolute inside a layout’s craftjs TextMultiloc' do
      craftjs = {
        'text-1' => { 'type' => { 'resolvedName' => 'TextMultiloc' },
                      'props' => { 'text' => { 'fr-FR' => '<img src="/rails/blobs/b/Pic.png">' } } }
      }
      record = register('content_builder/layout', { 'craftjs_json' => craftjs })

      importer.send(:absolutize_embedded_images!)

      expect(record.attributes['craftjs_json']['text-1']['props']['text']['fr-FR'])
        .to include('src="https://arcueil.fr/rails/blobs/b/Pic.png"')
    end

    it 'leaves absolute, data: and protocol-relative srcs untouched' do
      html = '<img src="https://cdn.fr/a.png"> <img src="data:image/png;base64,AAA"> <img src="//cdn.fr/b.png">'
      record = register('static_page', { 'top_info_section_multiloc' => { 'fr-FR' => html } })

      importer.send(:absolutize_embedded_images!)

      expect(record.attributes['top_info_section_multiloc']['fr-FR']).to eq(html)
    end

    it 'is a no-op when the source domain is unknown' do
      importer = described_class.new({ projects: [{ 'url' => '' }] })
      record = importer.ref_map.register('phase-1',
        DecidimImporter::Record.new('phase', { 'description_multiloc' => { 'fr-FR' => '<img src="/rails/a.png">' } }))

      importer.send(:absolutize_embedded_images!)

      expect(record.attributes['description_multiloc']['fr-FR']).to include('src="/rails/a.png"')
    end
  end

  describe '.prune_unreachable_embedded_images!' do
    it 'drops a non-fetchable (root-relative) img but keeps a reachable absolute one and inline data' do
      html = '<img src="/rails/x.png"> <img src="https://ok.fr/y.png"> <img src="data:image/png;base64,AAA">'
      template = { 'models' => { 'phase' => [{ 'description_multiloc' => { 'fr-FR' => html } }] } }

      # Pre-seed reachability so no real HTTP request is made for the absolute src.
      described_class.prune_unreachable_embedded_images!(template, { 'https://ok.fr/y.png' => true })

      result = template['models']['phase'][0]['description_multiloc']['fr-FR']
      expect(result).not_to include('/rails/x.png') # non-fetchable → dropped
      expect(result).to include('src="https://ok.fr/y.png"') # reachable → kept
      expect(result).to include('data:image/png;base64,AAA') # inline → kept
    end
  end
end
