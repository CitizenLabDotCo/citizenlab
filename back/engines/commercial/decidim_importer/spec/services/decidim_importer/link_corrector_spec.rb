# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::LinkCorrector do
  # A stand-in resolver: content/file lookups return whatever the test wires for a given URL.
  def resolver(content: {}, files: {})
    instance_double(DecidimImporter::ImportLinkResolver).tap do |double|
      allow(double).to receive(:content_href) { |url| content[url] }
      allow(double).to receive(:file_id) { |url| files[url] }
    end
  end

  def corrector(domain: 'participer.arcueil.fr', content: {}, files: {})
    described_class.new(original_domain: domain, resolver: resolver(content: content, files: files))
  end

  describe 'rule 3 — external_url redirect' do
    it 'unwraps a Decidim external-link redirect down to the URL it wraps' do
      url = 'https://participer.arcueil.fr/link?external_url=https%3A%2F%2Fwww.debatpublic.fr%2Fx'
      expect(corrector.resolve(url)).to eq(new: 'https://www.debatpublic.fr/x')
    end

    it 'decodes one layer of encoding, leaving any inner encoding intact' do
      url = 'https://d/link?external_url=https%3A%2F%2Fwww.arcueil.fr%2Fplan-2%2F%2520'
      expect(corrector.resolve(url)).to eq(new: 'https://www.arcueil.fr/plan-2/%20')
    end
  end

  describe 'rule 4 — Active Storage file links' do
    let(:blob) { 'https://participer.arcueil.fr/rails/active_storage/blobs/redirect/xyz/Plan.pdf' }

    it 'maps a matched blob link to the imported file id' do
      expect(corrector(files: { blob => 'file-abc' }).resolve(blob)).to eq(file_id: 'file-abc')
    end

    it 'flags an unmatched blob link as broken' do
      expect(corrector.resolve(blob)).to eq(broken: true)
    end
  end

  describe 'rule 2 — same-domain / relative content links' do
    it 'maps a same-domain process link to the matched project' do
      url = 'https://participer.arcueil.fr/processes/bp2019/f/35/'
      expect(corrector(content: { url => '/projects/bp2019' }).resolve(url)).to eq(new: '/projects/bp2019')
    end

    it 'maps a relative link to the matched project' do
      expect(corrector(content: { '/processes/bp2019' => '/projects/bp2019' }).resolve('/processes/bp2019'))
        .to eq(new: '/projects/bp2019')
    end

    it 'flags an unmatched same-domain link as broken' do
      expect(corrector.resolve('https://participer.arcueil.fr/processes/foo/f/9')).to eq(broken: true)
    end

    it 'flags an unmatched relative link as broken' do
      expect(corrector.resolve('/processes/foo/f/9')).to eq(broken: true)
    end
  end

  describe 'links it must not touch' do
    it 'leaves a genuine third-party link alone' do
      expect(corrector.resolve('https://www.google.fr/')).to be_nil
    end

    it 'ignores a blank URL' do
      expect(corrector.resolve('')).to be_nil
    end
  end

  it 'accepts a full URL as the original domain and ignores a leading www.' do
    c = corrector(domain: 'https://www.participer.arcueil.fr/')
    expect(c.resolve('https://participer.arcueil.fr/processes/foo')).to eq(broken: true)
  end
end
