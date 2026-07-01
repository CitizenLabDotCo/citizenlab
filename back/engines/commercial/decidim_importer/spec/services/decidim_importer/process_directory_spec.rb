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
# Each process becomes a Project. Steps are not imported as phases — only proposals/surveys are.
RSpec.describe DecidimImporter::Importer do
  let(:export_root) { DecidimImporter::DecidimExportFixture.csv_root }

  describe '.from_directory (participatory processes)' do
    it 'imports each process as a project, without turning its steps into phases' do
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

      # The Decidim short description + description become a Content Builder project-description layout
      # (two TextMultiloc blocks, short first) rather than `description_multiloc`.
      expect(project).not_to have_key('description_multiloc')
      layout = template['content_builder/layout'].find { |l| l['content_buildable_ref'].equal?(project) }
      expect(layout).to include('code' => 'project_description', 'enabled' => true)
      text_nodes = layout['craftjs_json'].values
        .select { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'TextMultiloc' }
      expect(text_nodes.size).to eq(2)
      expect(text_nodes.first['props']['text']['fr-FR']).to include('sum') # short_description ("Résumé …")
      expect(text_nodes.last['props']['text']['fr-FR']).to include('Concertation') # the full description

      # Steps are not imported as phases, and this process has no proposals/surveys — so no phases.
      phases = (template['phase'] || []).select { |ph| ph['project_ref'].equal?(project) }
      expect(phases).to be_empty
    end

    it 'nests a grouped process under its folder via a shared admin-publication ref' do
      template = described_class.from_directory(export_root).build_template.models['models']

      # The process references group `decidim-participatoryprocessgroup-1`, the first folder.
      folder = template['project_folders/folder'].first
      project = template['project'].first
      expect(project['admin_publication_attributes']['parent_attributes_ref'])
        .to equal(folder['admin_publication_attributes'])
    end
  end
end
