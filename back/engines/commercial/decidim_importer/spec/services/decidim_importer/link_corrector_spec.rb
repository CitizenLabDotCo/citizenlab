# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::LinkCorrector do
  # A stand-in resolver: content/file lookups return whatever the test wires for a given URL.
  def resolver(content: {}, files: {})
    instance_double(DecidimImporter::ImportLinkResolver).tap do |double|
      allow(double).to receive(:content_href) { |url| content[url] }
      allow(double).to receive(:file_href) { |url| files[url] }
    end
  end

  def corrector(domain: 'participer.arcueil.fr', content: {}, files: {})
    described_class.new(original_domain: domain, resolver: resolver(content: content, files: files))
  end

  def href(html)
    html[/href="([^"]*)"/, 1]
  end

  describe 'rule 3 — external_url redirect' do
    it 'unwraps a Decidim external-link redirect down to the URL it wraps' do
      html = '<a href="https://participer.arcueil.fr/link?external_url=https%3A%2F%2Fwww.debatpublic.fr%2Fx">t</a>'
      expect(href(corrector.correct(html))).to eq('https://www.debatpublic.fr/x')
    end

    it 'decodes one layer of encoding, leaving any inner encoding intact' do
      html = '<a href="https://d/link?external_url=https%3A%2F%2Fwww.arcueil.fr%2Fplan-2%2F%2520">t</a>'
      expect(href(corrector.correct(html))).to eq('https://www.arcueil.fr/plan-2/%20')
    end
  end

  describe 'rule 4 — Active Storage file links' do
    let(:blob) { 'https://participer.arcueil.fr/rails/active_storage/blobs/redirect/xyz/Plan.pdf' }

    it 'repoints a matched blob link at the imported file' do
      html = %(<a href="#{blob}">Plan</a>)
      result = corrector(files: { blob => '/uploads/files/file/content/abc/Plan.pdf' }).correct(html)
      expect(href(result)).to eq('/uploads/files/file/content/abc/Plan.pdf')
    end

    it 'leaves an unmatched blob link pointing at the original site' do
      html = %(<a href="#{blob}">Plan</a>)
      expect(href(corrector.correct(html))).to eq(blob)
    end
  end

  describe 'rule 2 — same-domain / relative content links' do
    it 'rewrites a same-domain process link to the matched project' do
      url = 'https://participer.arcueil.fr/processes/bp2019/f/35/'
      html = %(<a href="#{url}">Voir</a>)
      expect(href(corrector(content: { url => '/projects/bp2019' }).correct(html)))
        .to eq('/projects/bp2019')
    end

    it 'rewrites a relative link to the matched project' do
      html = '<a href="/processes/bp2019">Voir</a>'
      expect(href(corrector(content: { '/processes/bp2019' => '/projects/bp2019' }).correct(html)))
        .to eq('/projects/bp2019')
    end

    it 'leaves an unmatched same-domain link absolute and untouched' do
      url = 'https://participer.arcueil.fr/processes/foo/f/9'
      html = %(<a href="#{url}">x</a>)
      expect(href(corrector.correct(html))).to eq(url)
    end

    it 'makes an unmatched relative link absolute against the original domain' do
      html = '<a href="/processes/foo/f/9">x</a>'
      expect(href(corrector.correct(html))).to eq('https://participer.arcueil.fr/processes/foo/f/9')
    end
  end

  describe 'links it must not touch' do
    it 'leaves a genuine third-party link alone' do
      html = '<a href="https://www.google.fr/">g</a>'
      expect(corrector.correct(html)).to eq(html)
    end

    it 'passes non-string and link-less input straight through' do
      expect(corrector.correct(nil)).to be_nil
      expect(corrector.correct('<p>no links</p>')).to eq('<p>no links</p>')
    end
  end

  it 'corrects several links in one body and preserves the surrounding markup' do
    html = '<p>a <a class="c" href="/processes/bp2019">un</a> b ' \
           '<a href="https://www.google.fr/">deux</a></p>'
    result = corrector(content: { '/processes/bp2019' => '/projects/bp2019' }).correct(html)
    expect(result).to eq('<p>a <a class="c" href="/projects/bp2019">un</a> b ' \
                         '<a href="https://www.google.fr/">deux</a></p>')
  end

  it 'accepts a full URL as the original domain and ignores a leading www.' do
    c = corrector(domain: 'https://www.participer.arcueil.fr/')
    html = '<a href="https://participer.arcueil.fr/processes/foo">x</a>'
    expect(href(c.correct(html))).to eq('https://participer.arcueil.fr/processes/foo')
  end

  it 'corrects every locale of a multiloc' do
    result = corrector.correct_multiloc(
      'fr-FR' => '<a href="/processes/foo">fr</a>', 'en' => '<a href="/processes/foo">en</a>'
    )
    expect(result.values).to all(include('https://participer.arcueil.fr/processes/foo'))
  end
end
