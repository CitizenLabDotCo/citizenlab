# frozen_string_literal: true

require 'rails_helper'
require_relative '../../fixtures/decidim_export_fixture'

# Exercises the per-process directory layout of newer Decidim exports, read from the committed
# `spec/fixtures/decidim_export/`:
#   05---participatory-processes/
#     01--participatory-process-groups.csv
#     02---decidim--participatory-process--1/
#       01---participatory-process.csv
#       02---steps.csv
# Each process becomes a Project; each of its steps becomes an (information) Phase linked to it.
RSpec.describe DecidimImporter::Importer do
  let(:export_root) { DecidimImporter::DecidimExportFixture.csv_root }

  describe '.from_directory (participatory processes)' do
    it 'imports each process as a project with its steps as linked phases' do
      template = described_class.from_directory(export_root).build_template.models['models']

      project = template['project'].find { |p| p['title_multiloc']['fr-FR'] == 'Rue de demain' }
      expect(project).to be_present
      expect(project['description_preview_multiloc']['fr-FR']).to include('Résumé')
      expect(project['admin_publication_attributes']['publication_status']).to eq('published')

      phases = template['phase'].select { |ph| ph['project_ref'].equal?(project) }
      expect(phases.map { |ph| ph['title_multiloc']['fr-FR'] }).to eq(['État des lieux', "Plan d'actions"])
      expect(phases.map { |ph| ph['participation_method'] }.uniq).to eq(['information'])
    end

    it 'nests a grouped process under its folder via a shared admin-publication ref' do
      template = described_class.from_directory(export_root).build_template.models['models']

      # The process references group `decidim-participatoryprocessgroup-1`, the first folder.
      folder = template['project_folders/folder'].first
      project = template['project'].first
      expect(project['admin_publication_attributes']['parent_attributes_ref'])
        .to equal(folder['admin_publication_attributes'])
    end

    it 'skips steps without a start date and reports them' do
      importer = described_class.from_directory(export_root)
      importer.build_template
      expect(importer.skipped_phases.map { |s| s[:uid] }).to include('decidim--step--3')
    end
  end
end
