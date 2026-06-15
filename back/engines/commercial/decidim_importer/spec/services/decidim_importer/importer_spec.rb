# frozen_string_literal: true

require 'rails_helper'
require 'tempfile'
require_relative '../../fixtures/decidim_export_fixture'

RSpec.describe DecidimImporter::Importer do
  let(:export_root) { DecidimImporter::DecidimExportFixture.csv_root }

  # The imported proposals land in ideation phases, so the tenant needs the matching ideation
  # idea_statuses (a real tenant seeds these at creation; resolve them by code at apply time).
  before do
    %w[proposed under_consideration accepted rejected].each do |code|
      next if IdeaStatus.exists?(code: code, participation_method: 'ideation')

      create(:idea_status, code: code, participation_method: 'ideation')
    end
  end

  describe '.from_directory' do
    it 'scans the known Decidim CSVs out of the export directory' do
      importer = described_class.from_directory(export_root)
      template = importer.build_template.models['models']

      expect(template.keys).to include('user', 'project_folders/folder')
      expect(template['project_folders/folder'].size).to eq(2)
      # Fixture has 108 user rows; the unconfirmed account (decidim-user-131) must be skipped.
      expect(template['user'].size).to eq(107)
      expect(template['user'].map { |u| u['unique_code'] }).not_to include('decidim-user-131')
    end

    it 'adds a custom field for each enabled extra user field from the organization config' do
      template = described_class.from_directory(export_root).build_template.models['models']
      # The org enables `phone_number` (gender is a built-in, so not recreated).
      phone = template['custom_field'].find { |cf| cf['key'] == 'phone_number' }
      expect(phone).to include('resource_type' => 'User', 'input_type' => 'text')
    end

    it 'builds the app-config patch from the organization CSV' do
      patch = described_class.from_directory(export_root).app_config_patch
      expect(patch.dig('settings', 'core', 'locales')).to eq(%w[fr-FR en])
      expect(patch.dig('settings', 'core', 'organization_name')).to include('en' => 'Raynor, Heathcote and Moen')
    end
  end

  describe '#import' do
    it 'applies users, folders, the process project and its phases through the deserializer' do
      # The export's image URLs are `http://localhost/...` (Decidim dev instance), which CarrierWave
      # refuses to fetch. Skip image fetching for the test; production imports point at reachable
      # hosts.
      described_class.from_directory(export_root, import_images: false).import

      expect(ProjectFolders::Folder.count).to eq(2)
      admin = User.find_by(unique_code: 'decidim-user-1')
      expect(admin).to be_present
      expect(admin.admin?).to be(true)
      expect(admin.locale).to eq('en')
      expect(User.find_by(unique_code: 'decidim-user-131')).to be_nil # unconfirmed

      project = Project.find_by("title_multiloc->>'fr-FR' = 'Rue de demain'")
      expect(project).to be_present
      # Process references group `decidim-participatoryprocessgroup-1` (fr title "Ipsa at non.").
      parent_folder = ProjectFolders::Folder.find_by("title_multiloc->>'fr-FR' = 'Ipsa at non.'")
      expect(project.admin_publication.parent.publication).to eq(parent_folder)
      expect(project.phases.pluck(:participation_method)).to eq(%w[information information])
    end

    it 'creates the extra user custom field and populates its value from extended_data' do
      described_class.from_directory(export_root, import_images: false).import

      field = CustomField.registration.find_by(key: 'phone_number')
      expect(field).to be_present
      expect(field.input_type).to eq('text')
      admin = User.find_by(unique_code: 'decidim-user-1')
      expect(admin.custom_field_values['phone_number']).to eq('+33124124124')
    end

    context 'with a process that has a proposals component' do
      before { described_class.from_directory(export_root, import_images: false).import }

      let(:project) { Project.find_by("title_multiloc->>'fr-FR' = 'Espaces verts'") }

      it 'lays out the step, survey and proposals components as non-overlapping phases' do
        methods = project.phases.order(:start_at).pluck(:participation_method)
        expect(methods).to eq(%w[information native_survey ideation])
        # Sequential, non-overlapping: each phase starts on/after the previous one's end.
        starts_ends = project.phases.order(:start_at).pluck(:start_at, :end_at)
        starts_ends.each_cons(2) { |(_, prev_end), (next_start, _)| expect(next_start).to be >= prev_end }
      end

      it 'rebuilds the surveys component as a native_survey phase with a custom form' do
        survey_phase = project.phases.find_by(participation_method: 'native_survey')
        form = survey_phase.custom_form
        expect(form).to be_present

        fields = form.custom_fields.order(:ordering)
        expect(fields.first.input_type).to eq('page') # opens with a page
        expect(fields.last.input_type).to eq('page') # closes with a page
        expect(fields.map(&:input_type)).to include('text', 'select', 'multiselect', 'multiline_text')

        select = fields.find { |field| field.input_type == 'select' }
        expect(select.options.order(:ordering).map { |o| o.title_multiloc['fr-FR'] }).to eq(%w[Oui Non])
      end

      it 'imports proposals as ideas with mapped statuses, in the ideation phase' do
        ideation = project.phases.find_by(participation_method: 'ideation')
        accepted = Idea.find_by(title_multiloc: { 'fr-FR' => "Plus d'arbres" })

        expect(accepted.idea_status.code).to eq('accepted')
        expect(accepted.idea_status.participation_method).to eq('ideation')
        expect(accepted.author.unique_code).to eq('decidim-user-1')
        # Ideation is transitive: the idea links to the phase via ideas_phases, not creation_phase.
        expect(accepted.phases).to include(ideation)
        expect(accepted.creation_phase).to be_nil

        evaluating = Idea.find_by(title_multiloc: { 'fr-FR' => 'Éclairage' })
        # Its Decidim author (decidim-user-131) was filtered out, so the idea is author-less.
        expect(evaluating.author).to be_nil
        expect(evaluating.idea_status.code).to eq('under_consideration')
      end

      it 'imports the admin answer as official feedback and the comment thread' do
        accepted = Idea.find_by(title_multiloc: { 'fr-FR' => "Plus d'arbres" })
        expect(accepted.official_feedbacks.first.body_multiloc['fr-FR']).to include('acceptée')

        thread = accepted.comments.order(:created_at)
        expect(thread.size).to eq(2)
        expect(thread.last.parent).to eq(thread.first)

        # A comment whose Decidim author was filtered out is imported author-less.
        rejected = Idea.find_by(title_multiloc: { 'fr-FR' => 'Pistes cyclables' })
        expect(rejected.comments.first.author).to be_nil
      end
    end
  end

  describe '.apply_template_file' do
    # The dump → import split: dump the template to a file, then import that file independently of
    # the CSV pipeline.
    it 'imports a dumped tenant-template YAML file into the tenant' do
      yaml = described_class.from_directory(export_root).to_yaml
      file = Tempfile.new(['decidim', '.template.yml'])
      file.write(yaml)
      file.close

      described_class.apply_template_file(file.path, import_images: false)

      expect(ProjectFolders::Folder.count).to eq(2)
      expect(User.where(unique_code: %w[decidim-user-1]).count).to eq(1)
      expect(CustomField.registration.find_by(key: 'phone_number')).to be_present
    ensure
      file&.unlink
    end
  end

  describe '.strip_embedded_images!' do
    it 'removes <img> tags from rich-text multilocs but keeps the surrounding text' do
      template = { 'models' => { 'idea' => [{
        'body_multiloc' => { 'fr-FR' => '<p>Avant</p><img src="http://dead/x.png" alt="x"><p>Après</p>' },
        'title_multiloc' => { 'fr-FR' => 'Titre' }
      }] } }

      described_class.strip_embedded_images!(template)

      body = template['models']['idea'].first['body_multiloc']['fr-FR']
      expect(body).to eq('<p>Avant</p><p>Après</p>')
      expect(template['models']['idea'].first['title_multiloc']['fr-FR']).to eq('Titre')
    end
  end

  describe '.apply_app_config_file' do
    it 'deep-merges the patch settings into the tenant AppConfiguration' do
      file = Tempfile.new(['decidim', '.app_config.json'])
      file.write({ 'settings' => { 'core' => { 'organization_name' => { 'en' => 'Imported City' } } } }.to_json)
      file.close

      applied = described_class.apply_app_config_file(file.path, import_images: false)

      expect(applied).to be(true)
      # Deep-merge: the imported locale overrides en, the tenant's other settings are preserved.
      expect(AppConfiguration.instance.settings('core', 'organization_name')).to include('en' => 'Imported City')
    ensure
      file&.unlink
    end

    it 'is a no-op returning false when the file is absent' do
      expect(described_class.apply_app_config_file('/no/such.app_config.json')).to be(false)
    end

    it 'unions locales with the existing ones rather than dropping them' do
      existing = AppConfiguration.instance.settings('core', 'locales')
      expect(existing).not_to be_empty
      new_locale = 'fr-FR'

      described_class.apply_app_config({ 'settings' => { 'core' => { 'locales' => [new_locale] } } })

      locales = AppConfiguration.instance.settings('core', 'locales')
      expect(locales).to include(*existing, new_locale)
    end
  end
end
