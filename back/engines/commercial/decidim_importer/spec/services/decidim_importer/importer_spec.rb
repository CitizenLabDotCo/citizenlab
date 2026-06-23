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
      # The 18 fixture scopes become flat areas with unique sequential orderings.
      expect(template['area'].size).to eq(18)
      expect(template['area'].map { |a| a['ordering'] }).to eq((0..17).to_a)
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

    it 'imports a process\'s attachments as Files engine files attached to the project' do
      template = described_class.from_directory(export_root).build_template.models['models']

      espaces_verts = template['project'].find { |p| p['title_multiloc']['fr-FR'] == 'Espaces verts' }
      # The file name is the URL's decoded basename, with its extension preserved.
      expect(template['files/file'].map { |f| f['name'] })
        .to contain_exactly('Compte-rendu réunion.pdf', "Plan d'actions.pdf")
      expect(template['files/file'].map { |f| f['remote_content_url'] })
        .to all(start_with('http://example.org/files/redirect/'))

      # Each file is owned by (files_project) and attached to (file_attachment) the Espaces verts project.
      expect(template['files/files_project'].map { |fp| fp['project_ref'] }).to all(be(espaces_verts))
      expect(template['files/file_attachment'].map { |fa| fa['attachable_ref'] }).to all(be(espaces_verts))
      files = template['files/file']
      expect(template['files/files_project'].map { |fp| fp['file_ref'] }).to match_array(files)
      expect(template['files/file_attachment'].map { |fa| fa['file_ref'] }).to match_array(files)
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

      # Decidim scopes become flat Go Vocal areas.
      expect(Area.find_by("title_multiloc->>'en' = 'Schambergerton'")).to be_present
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
        # step (information) → survey (native_survey) → proposals (ideation), ordered by their
        # component dates. (The page component becomes a static page, not a phase.)
        methods = project.phases.order(:start_at).pluck(:participation_method)
        expect(methods).to eq(%w[information native_survey ideation])
        # Sequential, non-overlapping: each phase starts on/after the previous one's end.
        starts_ends = project.phases.order(:start_at).pluck(:start_at, :end_at)
        starts_ends.each_cons(2) { |(_, prev_end), (next_start, _)| expect(next_start).to be >= prev_end }
      end

      it 'imports a Decidim page as a project-scoped static page carrying the page body' do
        page = StaticPage.find_by("title_multiloc->>'fr-FR' = 'La concertation'")
        expect(page).to be_present
        expect(page.project).to eq(project)
        expect(page.code).to eq('custom')
        expect(page.top_info_section_enabled).to be(true)
        expect(page.top_info_section_multiloc['fr-FR']).to include('Contenu de la page')
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

      it 'imports a matrix_single question as a matrix_linear_scale with scale labels and placeholder rows' do
        survey_phase = project.phases.find_by(participation_method: 'native_survey')
        matrix = survey_phase.custom_form.custom_fields.find_by(input_type: 'matrix_linear_scale')

        expect(matrix).to be_present
        expect(matrix.maximum).to eq(2)
        expect(matrix.linear_scale_label_1_multiloc['fr-FR']).to eq('Souvent')
        expect(matrix.matrix_statements.order(:ordering).map(&:key)).to eq(%w[statement_1 statement_2])
        expect(matrix.matrix_statements.first.title_multiloc).to eq('fr-FR' => '[1]')
      end

      it 'backfills phase permissions so a native_survey phase has its posting permission' do
        survey_phase = project.phases.find_by(participation_method: 'native_survey')
        # Without this the admin projects endpoint 500s (posting_permission delegated to nil).
        expect(Permission.find_by(permission_scope: survey_phase, action: 'posting_idea')).to be_present
        expect { survey_phase.pmethod.user_data_collection }.not_to raise_error
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

  describe '.resolve_area_orderings!' do
    it "offsets imported area orderings past the tenant's existing areas" do
      create(:area)
      base = Area.maximum(:ordering) + 1
      template = { 'models' => { 'area' => [{ 'ordering' => 0 }, { 'ordering' => 3 }] } }

      described_class.resolve_area_orderings!(template)

      expect(template['models']['area'].map { |a| a['ordering'] }).to eq([base, base + 3])
    end

    it 'is a no-op when there are no areas in the template' do
      expect { described_class.resolve_area_orderings!({ 'models' => {} }) }.not_to raise_error
    end
  end

  describe '#import (re-import safety)' do
    before do
      %w[proposed under_consideration accepted rejected].each do |code|
        next if IdeaStatus.exists?(code: code, participation_method: 'ideation')

        create(:idea_status, code: code, participation_method: 'ideation')
      end
    end

    it 'imports areas even when the tenant already has areas (no ordering collision)' do
      create(:area) # pre-existing area occupying an ordering
      expect { described_class.from_directory(export_root, import_images: false).import }.not_to raise_error
      expect(Area.find_by("title_multiloc->>'en' = 'Schambergerton'")).to be_present
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

  describe '.prune_unreachable_embedded_images!' do
    it 'drops only the embedded images whose source is unreachable, keeping the rest and the text' do
      allow(described_class).to receive(:image_reachable?).with('http://live/ok.png').and_return(true)
      allow(described_class).to receive(:image_reachable?).with('http://dead/gone.png').and_return(false)
      template = { 'models' => { 'idea' => [{
        'body_multiloc' => { 'fr-FR' => '<p>A</p><img src="http://live/ok.png"><img src="http://dead/gone.png"><p>B</p>' }
      }] } }

      described_class.prune_unreachable_embedded_images!(template)

      expect(template['models']['idea'].first['body_multiloc']['fr-FR'])
        .to eq('<p>A</p><img src="http://live/ok.png"><p>B</p>')
    end

    it 'leaves base64 images untouched and probes each distinct url only once' do
      allow(described_class).to receive(:image_reachable?).and_return(true)
      template = { 'models' => { 'idea' => [
        { 'body_multiloc' => { 'fr-FR' => '<img src="http://x/a.png"><img src="data:image/png;base64,AAAA">' } },
        { 'body_multiloc' => { 'en' => '<img src="http://x/a.png">' } }
      ] } }

      described_class.prune_unreachable_embedded_images!(template)

      expect(template['models']['idea'].first['body_multiloc']['fr-FR']).to include('data:image/png;base64,AAAA')
      expect(described_class).to have_received(:image_reachable?).once # memoised across records/locales
    end
  end

  describe '.prune_fileless_attachments!' do
    it 'drops content-less files and their dependent join/attachment records, keeping the rest' do
      kept = { 'name' => 'kept.pdf', 'remote_content_url' => 'http://x/y.pdf' }
      gone = { 'name' => 'gone.pdf' } # its content URL was stripped/pruned
      template = { 'models' => {
        'files/file' => [kept, gone],
        'files/files_project' => [{ 'file_ref' => kept }, { 'file_ref' => gone }],
        'files/file_attachment' => [{ 'file_ref' => kept }, { 'file_ref' => gone }]
      } }

      described_class.prune_fileless_attachments!(template)

      expect(template['models']['files/file'].map { |f| f['name'] }).to eq(['kept.pdf'])
      expect(template['models']['files/files_project'].map { |fp| fp['file_ref'] }).to eq([kept])
      expect(template['models']['files/file_attachment'].map { |fa| fa['file_ref'] }).to eq([kept])
    end

    it 'is a no-op when the template has no files' do
      expect { described_class.prune_fileless_attachments!({ 'models' => {} }) }.not_to raise_error
    end
  end

  describe '.prune_imageless_project_images!' do
    it 'drops project images whose image url was stripped/pruned, keeping the rest' do
      template = { 'models' => { 'project_image' => [
        { 'ordering' => 0, 'remote_image_url' => 'http://x/hero.png' },
        { 'ordering' => 0 } # its image URL was stripped/pruned
      ] } }

      described_class.prune_imageless_project_images!(template)

      expect(template['models']['project_image'].map { |i| i['remote_image_url'] }).to eq(['http://x/hero.png'])
    end

    it 'is a no-op when the template has no project images' do
      expect { described_class.prune_imageless_project_images!({ 'models' => {} }) }.not_to raise_error
    end
  end

  describe '.image_reachable?' do
    it 'is reachable via a ranged GET even when HEAD is forbidden (presigned S3 URL)' do
      # Active Storage redirects to presigned S3 URLs signed for GET only: HEAD → 403, GET → 200.
      stub_request(:head, 'https://s3.example/file.pdf').to_return(status: 403)
      stub_request(:get, 'https://s3.example/file.pdf').to_return(status: 200)

      expect(described_class.image_reachable?('https://s3.example/file.pdf')).to be(true)
    end

    it 'follows redirects to the underlying blob (206 Partial Content counts as reachable)' do
      stub_request(:get, 'https://app.example/redirect/file.pdf')
        .to_return(status: 302, headers: { 'Location' => 'https://s3.example/blob.pdf' })
      stub_request(:get, 'https://s3.example/blob.pdf').to_return(status: 206)

      expect(described_class.image_reachable?('https://app.example/redirect/file.pdf')).to be(true)
    end

    it 'is false for a genuinely missing file' do
      stub_request(:get, 'https://s3.example/gone.pdf').to_return(status: 404)

      expect(described_class.image_reachable?('https://s3.example/gone.pdf')).to be(false)
    end
  end

  describe '.prune_unreachable_remote_urls!' do
    it 'drops only the remote_*_url attachments that are unreachable' do
      allow(described_class).to receive(:image_reachable?).with('http://live/a.png').and_return(true)
      allow(described_class).to receive(:image_reachable?).with('http://dead/b.png').and_return(false)
      template = { 'models' => {
        'user' => [{ 'email' => 'a@b.co', 'remote_avatar_url' => 'http://dead/b.png' }],
        'project' => [{ 'remote_header_bg_url' => 'http://live/a.png' }]
      } }

      described_class.prune_unreachable_remote_urls!(template)

      expect(template['models']['user'].first).not_to have_key('remote_avatar_url')
      expect(template['models']['project'].first['remote_header_bg_url']).to eq('http://live/a.png')
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

    it 'replaces the tenant locales with the imported ones, migrating users off dropped locales' do
      # The default tenant supports several locales (incl. fr-FR); importing only 'en' drops the rest.
      expect(AppConfiguration.instance.settings('core', 'locales')).to include('fr-FR')
      user = create(:user, locale: 'fr-FR')

      described_class.apply_app_config({ 'settings' => { 'core' => { 'locales' => ['en'] } } })

      expect(AppConfiguration.instance.settings('core', 'locales')).to eq(['en'])
      expect(user.reload.locale).to eq('en') # migrated to the first new locale
    end
  end
end
