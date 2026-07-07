# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::LinkMap do
  # A corrector stub whose decisions are wired per URL.
  def corrector(decisions)
    instance_double(DecidimImporter::LinkCorrector).tap do |double|
      allow(double).to receive(:resolve) { |url| decisions[url] }
    end
  end

  describe '.build' do
    it 'classifies every link found in the HTML into replacements, file refs and broken' do
      html = '<p><a href="/processes/a">A</a> <a href="/blob/x.pdf">F</a> ' \
             '<a href="/processes/gone">B</a> <a href="https://ext.example/x">C</a></p>'
      map = described_class.build([html], corrector(
        '/processes/a' => { new: '/projects/a' },
        '/blob/x.pdf' => { file_id: 'file-1' },
        '/processes/gone' => { broken: true },
        'https://ext.example/x' => nil
      ))

      expect(map.replacements).to eq('/processes/a' => '/projects/a')
      expect(map.file_refs).to eq('/blob/x.pdf' => 'file-1')
      expect(map.broken).to eq(['/processes/gone'])
    end

    it 'decodes HTML entities in the href before classifying, and dedupes' do
      html = '<a href="/p?a=1&amp;b=2">x</a><a href="/p?a=1&amp;b=2">y</a>'
      built = corrector('/p?a=1&b=2' => { new: '/projects/p' })
      expect(described_class.build([html], built).replacements).to eq('/p?a=1&b=2' => '/projects/p')
    end
  end

  describe '#apply' do
    subject(:map) do
      described_class.new({ '/processes/a' => '/projects/a' }, { '/blob/x.pdf' => 'file-1' }, ['/processes/gone'])
    end

    let(:files) { ->(id) { { 'file-1' => '/uploads/real/x.pdf' }[id] } }

    it 'rewrites a mapped URL link and reports nothing broken' do
      html, broken = map.apply('<a href="/processes/a">A</a>', file_resolver: files)
      expect(html).to eq('<a href="/projects/a">A</a>')
      expect(broken).to be_empty
    end

    it 'rewrites a file link to the resolved content URL' do
      html, broken = map.apply('<a href="/blob/x.pdf">F</a>', file_resolver: files)
      expect(html).to eq('<a href="/uploads/real/x.pdf">F</a>')
      expect(broken).to be_empty
    end

    it 'reports a file link whose file no longer resolves, leaving it untouched' do
      html, broken = map.apply('<a href="/blob/x.pdf">F</a>', file_resolver: ->(_) {})
      expect(html).to eq('<a href="/blob/x.pdf">F</a>')
      expect(broken).to eq(['/blob/x.pdf'])
    end

    it 'leaves a broken link untouched but reports it' do
      html, broken = map.apply('<a href="/processes/gone">G</a>', file_resolver: files)
      expect(html).to eq('<a href="/processes/gone">G</a>')
      expect(broken).to eq(['/processes/gone'])
    end

    it 'leaves an unknown link untouched and unreported' do
      html, broken = map.apply('<a href="https://other/x">O</a>', file_resolver: files)
      expect(html).to eq('<a href="https://other/x">O</a>')
      expect(broken).to be_empty
    end

    it 'matches an entity-encoded href against the decoded mapping key, preserving other attributes' do
      encoded = described_class.new({ '/p?a=1&b=2' => '/projects/p' }, {}, [])
      html, = encoded.apply('<p><a class="c" href="/p?a=1&amp;b=2" rel="x">y</a></p>')
      expect(html).to eq('<p><a class="c" href="/projects/p" rel="x">y</a></p>')
    end
  end

  describe 'CSV round-trip' do
    it 'writes and reads back replacements, file refs and broken links' do
      dir = Dir.mktmpdir
      path = File.join(dir, 'url_mapping.csv')
      described_class.new({ '/processes/a' => '/projects/a' }, { '/blob/x.pdf' => 'file-1' }, ['/processes/gone'])
        .write_csv(path)

      reloaded = described_class.read_csv(path)
      expect(reloaded.replacements).to eq('/processes/a' => '/projects/a')
      expect(reloaded.file_refs).to eq('/blob/x.pdf' => 'file-1')
      expect(reloaded.broken).to eq(['/processes/gone'])
    ensure
      FileUtils.remove_entry(dir)
    end
  end
end
