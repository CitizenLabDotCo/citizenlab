# frozen_string_literal: true

require 'rails_helper'
require 'csv'

RSpec.describe DecidimImporter::ExportReader do
  around do |example|
    Dir.mktmpdir { |dir| @root = dir and example.run }
  end

  attr_reader :root

  def write_csv(rel, headers, *rows)
    path = File.join(root, rel)
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, CSV.generate do |csv|
      csv << headers
      rows.each { |row| csv << row }
    end)
  end

  # A minimal participatory process so the process branch is exercised alongside assemblies.
  def write_process(uid, group: '')
    write_csv('04---participatory-processes/01---decidim--participatory-process--1/01---participatory-process.csv',
      %w[uid title participatory_process_group url],
      [uid, %({"fr":"Process"}), group, "https://x.fr/processes/#{uid}"])
  end

  def write_assembly(seq, uid)
    write_csv("05---assemblies/#{seq}---decidim--assembly--#{seq}/01---assembly.csv",
      %w[uid title url], [uid, %({"fr":"Assembly #{seq}"}), "https://x.fr/assemblies/#{uid}"])
  end

  describe 'assemblies' do
    it 'reads assemblies into :projects stamped with the synthetic Assemblies group' do
      write_process('decidim--process--1')
      write_assembly(1, 'decidim--assembly--1')
      write_assembly(2, 'decidim--assembly--2')

      projects = described_class.read(root)[:projects]

      assemblies = projects.select { |row| row['participatory_process_group'] == described_class::ASSEMBLIES_FOLDER_UID }
      expect(assemblies.map { |row| row['uid'] }).to contain_exactly('decidim--assembly--1', 'decidim--assembly--2')
      # the real process keeps its own (blank) group — it isn't routed into the Assemblies folder
      expect(projects.find { |row| row['uid'] == 'decidim--process--1' }['participatory_process_group']).to eq('')
    end

    it 'injects a single Assemblies folder for the assembly projects to nest under' do
      write_assembly(1, 'decidim--assembly--1')

      folders = described_class.read(root)[:folders]

      expect(folders).to contain_exactly(
        'uid' => described_class::ASSEMBLIES_FOLDER_UID, 'title' => 'Assemblies'
      )
    end

    it 'appends the Assemblies folder alongside participatory-process-group folders' do
      write_csv('04---participatory-processes/01--participatory-process-groups.csv',
        %w[uid title], ['decidim-group-1', %({"fr":"Env."})])
      write_assembly(1, 'decidim--assembly--1')

      uids = described_class.read(root)[:folders].map { |row| row['uid'] }

      expect(uids).to eq(['decidim-group-1', described_class::ASSEMBLIES_FOLDER_UID])
    end

    it 'does not inject the folder when the export has no assemblies' do
      write_process('decidim--process--1')

      rows = described_class.read(root)

      expect(rows[:folders]).to be_nil
      expect(rows[:projects].map { |row| row['uid'] }).to eq(['decidim--process--1'])
    end

    it 'stamps an assembly’s attachments and components with the assembly uid as the process' do
      write_assembly(1, 'decidim--assembly--1')
      write_csv('05---assemblies/1---decidim--assembly--1/04---attachments.csv',
        %w[uid title url], ['att-1', %({"fr":"Doc"}), 'https://x.fr/doc.pdf'])
      write_csv('05---assemblies/1---decidim--assembly--1/07---components/01---decidim--component--53---proposals/01---component.csv',
        %w[uid name published_at], ['comp-53', %({"fr":"Idées"}), '2022-01-01'])

      rows = described_class.read(root)

      expect(rows[:attachments].first).to include('decidim_participatory_process' => 'decidim--assembly--1')
      component = rows[:components].find { |row| row['uid'] == 'comp-53' }
      expect(component).to include('decidim_participatory_process' => 'decidim--assembly--1', 'type' => 'proposals')
    end
  end
end
