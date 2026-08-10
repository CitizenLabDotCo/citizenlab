# frozen_string_literal: true

require 'rails_helper'
require 'tmpdir'
require 'zip'

RSpec.describe DecidimImporter::ZipExtractor do
  describe '.extract' do
    around do |example|
      Dir.mktmpdir('decidim_zip_spec_') do |root|
        @root = root
        example.run
      end
    end

    def build_zip(entries)
      path = File.join(@root, 'export.zip')
      Zip::File.open(path, create: true) do |zip|
        entries.each { |name, body| zip.get_output_stream(name) { |io| io.write(body) } }
      end
      path
    end

    it 'extracts entries into the destination' do
      zip = build_zip('example.com--2024/01--users.csv' => 'id\nrow')
      dest = File.join(@root, 'out')

      described_class.extract(zip, dest)

      expect(File.read(File.join(dest, 'example.com--2024/01--users.csv'))).to eq('id\nrow')
    end

    it 'skips macOS/dotfile metadata entries' do
      zip = build_zip('__MACOSX/._x.csv' => 'junk', '.DS_Store' => 'junk', 'real.csv' => 'ok')
      dest = File.join(@root, 'out')

      described_class.extract(zip, dest)

      expect(Dir.children(dest)).to contain_exactly('real.csv')
    end

    it 'does not write outside the destination for a path-traversal (Zip Slip) entry' do
      zip = build_zip('../escaped.csv' => 'pwned', 'safe.csv' => 'ok')
      dest = File.join(@root, 'out')

      described_class.extract(zip, dest)

      # The traversal entry is dropped; only the safe one lands, and nothing escapes `dest`.
      expect(File).not_to exist(File.join(@root, 'escaped.csv'))
      expect(File.read(File.join(dest, 'safe.csv'))).to eq('ok')
    end
  end

  describe '.compress' do
    around do |example|
      Dir.mktmpdir('decidim_zip_spec_') do |root|
        @root = root
        example.run
      end
    end

    it 'bundles files by basename into a flat archive that .extract unpacks back' do
      a = File.join(@root, 'x.template.yml')
      b = File.join(@root, 'x.moderators.csv')
      File.write(a, 'models: {}')
      File.write(b, "user_unique_code,project_slug\nu-1,bp2019")
      zip = File.join(@root, 'x.template.zip')

      described_class.compress([a, b], zip)
      dest = File.join(@root, 'out')
      described_class.extract(zip, dest)

      expect(Dir.children(dest)).to contain_exactly('x.template.yml', 'x.moderators.csv')
      expect(File.read(File.join(dest, 'x.moderators.csv'))).to eq("user_unique_code,project_slug\nu-1,bp2019")
    end

    it 'replaces an existing archive at the target path' do
      old = File.join(@root, 'a.txt')
      File.write(old, 'a')
      zip = File.join(@root, 'out.zip')
      described_class.compress([old], zip)

      new = File.join(@root, 'b.txt')
      File.write(new, 'b')
      described_class.compress([new], zip)

      dest = File.join(@root, 'out')
      described_class.extract(zip, dest)
      expect(Dir.children(dest)).to contain_exactly('b.txt')
    end
  end
end
