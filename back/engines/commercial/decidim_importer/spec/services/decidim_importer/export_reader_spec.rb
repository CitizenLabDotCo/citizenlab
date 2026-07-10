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

  describe 'comment votes' do
    it 'reads a proposals component’s comments-votes sidecar, stamped with process + component' do
      write_process('decidim--process--1')
      comp = '04---participatory-processes/01---decidim--participatory-process--1/07---components/01---decidim--component--61---proposals'
      write_csv("#{comp}/01---component.csv", %w[uid name], ['comp-61', %({"fr":"Idées"})])
      write_csv("#{comp}/08---comments-votes.csv",
        %w[uid comment author value], %w[vote-1 comment-37 user-818 up])

      votes = described_class.read(root)[:comment_votes]

      expect(votes.first).to include('uid' => 'vote-1', 'comment' => 'comment-37', 'value' => 'up',
        'decidim_participatory_process' => 'decidim--process--1', 'decidim_component' => 'comp-61')
    end
  end

  describe 'budgets' do
    it 'reads a budgets component’s nested budget/projects/orders/followers, stamped with process + component' do
      write_process('decidim--process--1')
      comp = '04---participatory-processes/01---decidim--participatory-process--1/07---components/03---decidim--component--63---budgets'
      budget = "#{comp}/04---decidim--budgets--budget--1"
      write_csv("#{comp}/01---component.csv", %w[uid name], ['comp-63', %({"fr":"Vote"})])
      write_csv("#{budget}/01---budget.csv", %w[uid title total_budget], ['budget-1', %({"fr":"B"}), '190000'])
      write_csv("#{budget}/02---projects.csv", %w[uid title budget_amount], ['proj-1', %({"fr":"P"}), '30000'])
      write_csv("#{budget}/03---orders.csv", %w[uid user checked_out_at], %w[order-1 user-1 2024-06-03])
      write_csv("#{budget}/08---followers.csv", %w[uid user followable], %w[f-1 user-1 proj-1])

      rows = described_class.read(root)
      stamp = { 'decidim_participatory_process' => 'decidim--process--1', 'decidim_component' => 'comp-63' }

      expect(rows[:budgets].first).to include('uid' => 'budget-1', 'total_budget' => '190000', **stamp)
      expect(rows[:budget_projects].first).to include('uid' => 'proj-1', 'budget_amount' => '30000', **stamp)
      expect(rows[:orders].first).to include('uid' => 'order-1', 'checked_out_at' => '2024-06-03', **stamp)
      # Budget followers reuse the proposal-follow path (they become follows on the budget-project idea).
      expect(rows[:followers].first).to include('uid' => 'f-1', 'followable' => 'proj-1', **stamp)
    end
  end
end
