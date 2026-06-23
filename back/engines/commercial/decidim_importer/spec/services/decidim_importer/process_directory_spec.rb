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
      # The preview is plain text: tags are removed and HTML entities decoded — `&eacute;` → é,
      # `&amp;` → &, and `&nbsp;` collapses into a normal space.
      expect(project['description_preview_multiloc']['fr-FR']).to eq('Résumé : rue & demain')
      expect(project['admin_publication_attributes']['publication_status']).to eq('published')

      # The Decidim hero image becomes both the page header background and the project card image
      # (a ProjectImage), so it shows on the project tile in listings.
      expect(project['remote_header_bg_url']).to eq('http://example.org/hero.png')
      card_image = template['project_image'].find { |img| img['project_ref'].equal?(project) }
      expect(card_image).to include('remote_image_url' => 'http://example.org/hero.png', 'ordering' => 0)

      # The Decidim description becomes a Content Builder project-description layout (a TextMultiloc
      # block) rather than `description_multiloc`.
      expect(project).not_to have_key('description_multiloc')
      layout = template['content_builder/layout'].find { |l| l['content_buildable_ref'].equal?(project) }
      expect(layout).to include('code' => 'project_description', 'enabled' => true)
      text_node = layout['craftjs_json'].values.find { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'TextMultiloc' }
      expect(text_node['props']['text']['fr-FR']).to include('Concertation')

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
