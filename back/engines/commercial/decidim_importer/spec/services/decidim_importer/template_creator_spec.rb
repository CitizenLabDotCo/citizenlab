# frozen_string_literal: true

require 'rails_helper'
require_relative '../../fixtures/decidim_export_fixture'

RSpec.describe DecidimImporter::TemplateCreator do
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
      creator = described_class.from_directory(export_root)
      template = creator.build_template.models['models']

      expect(template.keys).to include('user', 'project_folders/folder')
      expect(template['project_folders/folder'].size).to eq(2)
      # Fixture has 108 user rows; the unconfirmed account (decidim-user-131) must be skipped.
      expect(template['user'].size).to eq(107)
      expect(template['user'].map { |u| u['unique_code'] }).not_to include('decidim-user-131')
      # The 18 fixture scopes become flat areas with unique sequential orderings.
      expect(template['area'].size).to eq(18)
      expect(template['area'].map { |a| a['ordering'] }).to eq((0..17).to_a)
    end

    it 'scopes the export to the given container, keeping only its project and referenced users' do
      template = described_class.from_directory(export_root, container_ids: ['decidim--process--2'])
        .build_template.models['models']

      # only Espaces verts; the other processes' projects are gone
      expect(template['project'].map { |p| p['title_multiloc']['fr-FR'] }).to eq(['Espaces verts'])
      # only the users Espaces verts references — a subset of the full 107, and non-empty
      expect(template['user']).to be_present
      expect(template['user'].size).to be < 107
      # scopes → areas are dropped (a supplemental import reuses the tenant's existing ones)
      expect(template).not_to have_key('area')
    end

    it 'still emits the app-config locale patch when scoped (the tenant needs those locales)' do
      full_locales = described_class.from_directory(export_root).app_config_patch.dig('settings', 'core', 'locales')
      expect(full_locales).to be_present

      scoped = described_class.from_directory(export_root, container_ids: ['decidim--process--2']).app_config_patch
      # scoping must not drop the locales — they'd otherwise be missing from the supplemental import's patch
      expect(scoped.dig('settings', 'core', 'locales')).to eq(full_locales)
    end

    it 'adds a custom field for each enabled extra user field from the organization config' do
      template = described_class.from_directory(export_root).build_template.models['models']
      # The org enables `phone_number` (gender is a built-in, so not recreated).
      phone = template['custom_field'].find { |cf| cf['key'] == 'phone_number' }
      expect(phone).to include('resource_type' => 'User', 'input_type' => 'text')
    end

    it 'builds the app-config patch (locales + feature flags) from the organization CSV' do
      patch = described_class.from_directory(export_root).app_config_patch
      expect(patch.dig('settings', 'core', 'locales')).to eq(%w[fr-FR en])
      expect(patch.dig('settings', 'parallel_participation')).to eq('allowed' => true, 'enabled' => true)
    end

    it 'imports a process\'s attachments as Files engine files owned by (but not attached to) the project' do
      template = described_class.from_directory(export_root).build_template.models['models']

      # The file name is the attachment title with the URL's extension appended.
      process_files = template['files/file']
        .select { |f| f['name'].in?(['Compte-rendu de la réunion.pdf', "Plan d'actions.pdf"]) }
      expect(process_files.size).to eq(2)
      expect(process_files.map { |f| f['remote_content_url'] })
        .to all(start_with('http://example.org/files/redirect/'))

      # Each file is owned by a project (files_project) so it's available and linkable from the
      # description — but the *process* files are not surfaced as attachments (no file_attachment).
      expect(template['files/files_project'].map { |fp| fp['project_ref'] }).to all(be_present)
      attached_names = (template['files/file_attachment'] || []).map { |fa| fa['file_ref']['name'] }
      expect(attached_names).not_to include('Compte-rendu de la réunion.pdf', "Plan d'actions.pdf")
    end

    it 'imports proposal attachments as file attachments on the idea, owned by its project' do
      template = described_class.from_directory(export_root).build_template.models['models']

      idea = template['idea'].find { |i| i['title_multiloc']['fr-FR'] == "Plus d'arbres" }
      file = template['files/file'].find { |f| f['name'] == 'schema.pdf' }
      expect(file).to be_present

      # Attached to the idea, and owned by the idea's project so `validate_file_belongs_to_project` passes.
      attachment = template['files/file_attachment'].find { |fa| fa['file_ref'].equal?(file) }
      expect(attachment['attachable_ref']).to be(idea)
      expect(template['files/files_project'].find { |fp| fp['file_ref'].equal?(file) }).to be_present

      # The attachment is emitted after the idea, so its `attachable_ref` resolves on deserialize.
      keys = template.keys
      expect(keys.index('files/file_attachment')).to be > keys.index('idea')

      # The idea's file must NOT also be surfaced in the project-description layout — otherwise the
      # layout would re-attach it and trip FileAttachment's idea-uniqueness validation at import.
      espaces = template['project'].find { |p| p['title_multiloc']['fr-FR'] == 'Espaces verts' }
      layout = template['content_builder/layout'].find { |l| l['content_buildable_ref'].equal?(espaces) }
      layout_file_ids = layout['craftjs_json'].values
        .select { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'FileAttachment' }
        .map { |n| n.dig('props', 'fileId') }
      expect(layout_file_ids).not_to include(file['id'])
    end

    it 'keeps the Decidim slug on the imported project' do
      template = described_class.from_directory(export_root).build_template.models['models']
      espaces = template['project'].find { |p| p['title_multiloc']['fr-FR'] == 'Espaces verts' }
      expect(espaces['slug']).to eq('espaces-verts')
    end

    it 'builds an old→new URL mapping for the links in the project descriptions, leaving the text as-is' do
      creator = described_class.from_directory(export_root)
      template = creator.build_template.models['models']
      map = creator.link_map

      espaces = template['project'].find { |p| p['title_multiloc']['fr-FR'] == 'Espaces verts' }
      file = creator.ref_map.records
        .find { |r| r.model_name == 'files/file' && r.attributes['name'] == "Plan d'actions.pdf" }
      text = template['content_builder/layout']
        .find { |l| l['content_buildable_ref'].equal?(espaces) }['craftjs_json'].values
        .select { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'TextMultiloc' }
        .map { |n| n.dig('props', 'text', 'fr-FR') }.join

      expect(map.replacements).to include(
        # rule 2 — a same-domain process link → the matched (imported) project
        'https://example.decidim.org/processes/rue-de-demain/f/9/' => '/projects/rue-de-demain',
        # rule 3 — the Decidim external-link redirect unwrapped to its target
        'https://example.decidim.org/link?external_url=https%3A%2F%2Fwww.exemple.fr%2Fdoc' =>
          'https://www.exemple.fr/doc'
      )
      # rule 4 — the Active Storage link → the imported file's id (its real URL is resolved after import)
      expect(map.file_refs).to include(
        "https://example.decidim.org/rails/active_storage/blobs/redirect/xyz/Plan%20d'actions.pdf" =>
          file.attributes['id']
      )
      # an unmatched same-domain link is flagged broken; a genuine third-party link is ignored
      expect(map.broken).to include('/processes/introuvable/f/1')
      expect(map.replacements).not_to have_key('https://www.google.fr/')
      expect(map.broken).not_to include('https://www.google.fr/')

      # The template text itself is untouched — correction happens after import, via the rake task.
      expect(text).to include('href="https://example.decidim.org/processes/rue-de-demain/f/9/"')
    end
  end

  describe '#import' do
    it 'applies users, folders, the process project and its phases through the deserializer' do
      # The export's image URLs are `http://localhost/...` (Decidim dev instance), which CarrierWave
      # refuses to fetch. Skip image fetching for the test; production imports point at reachable
      # hosts.
      described_class.from_directory(export_root, import_uploads: false).import

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
      # Steps aren't imported as phases; this process's accountability component is its one ideation phase.
      expect(project.phases.pluck(:participation_method)).to eq(['ideation'])

      # Decidim scopes become flat Go Vocal areas.
      expect(Area.find_by("title_multiloc->>'en' = 'Schambergerton'")).to be_present
    end

    it 'provisions a project_page layout wrapping the imported description, so the project page renders' do
      described_class.from_directory(export_root, import_uploads: false).import
      project = Project.find_by("title_multiloc->>'fr-FR' = 'Espaces verts'")

      # The page now renders from a `project_page` layout (generated from the `project_description`
      # layout the importer built); without it the project page endpoint 404s.
      page = ContentBuilder::Layout.find_by(content_buildable: project, code: 'project_page')
      expect(page).to be_present
      expect(page.enabled).to be(true)
      expect(page.craftjs_json.dig('ROOT', 'type', 'resolvedName')).to eq('ProjectPageRoot')

      # The imported description was injected into the page body.
      body = page.craftjs_json['PROJECT_PAGE_BODY']
      description_ids = body['nodes'] - %w[PROJECT_PAGE_PHASES PROJECT_PAGE_EVENTS]
      expect(description_ids).not_to be_empty
    end

    it 'imports an accountability component as an ideation phase, with its results as ideas carrying a progress line' do
      described_class.from_directory(export_root, import_uploads: false).import
      project = Project.find_by("title_multiloc->>'fr-FR' = 'Rue de demain'")

      phase = project.phases.sole
      expect(phase.participation_method).to eq('ideation')
      expect(phase.title_multiloc['fr-FR']).to eq('Suivi') # titled by the component name

      idea = Idea.find_by(title_multiloc: { 'fr-FR' => 'Nouvelle place' })
      expect(idea.phases).to include(phase)
      expect(idea.author).to be_nil # results have no author
      # A bulleted Progress + Status (name - description) block is prepended to the description. (Loose
      # includes: the idea-body sanitiser inserts newlines between the list tags on save.) The labels are
      # i18n (`decidim_importer.accountability_*`), rendered in the result's fr-FR locale.
      progress_label = I18n.t('decidim_importer.accountability_progress', locale: 'fr-FR')
      status_label = I18n.t('decidim_importer.accountability_status', locale: 'fr-FR')
      body = idea.body_multiloc['fr-FR']
      expect(body).to include("<strong>#{progress_label}:</strong> 100% ") # the space after % survives sanitisation
      expect(body).to include("<strong>#{status_label}:</strong> Réalisé - Projet terminé")
      expect(body).to include('Une place rénovée')

      # A result at 40% maps to the 40% status.
      other = Idea.find_by(title_multiloc: { 'fr-FR' => 'Étude en cours' })
      expect(other.body_multiloc['fr-FR']).to include("<strong>#{status_label}:</strong> À l'étude - En cours d'étude")
    end

    it 'creates the extra user custom field and populates its value from extended_data' do
      described_class.from_directory(export_root, import_uploads: false).import

      field = CustomField.registration.find_by(key: 'phone_number')
      expect(field).to be_present
      expect(field.input_type).to eq('text')
      admin = User.find_by(unique_code: 'decidim-user-1')
      expect(admin.custom_field_values['phone_number']).to eq('+33124124124')
    end

    context 'with a process that has a proposals component' do
      before { described_class.from_directory(export_root, import_uploads: false).import }

      let(:project) { Project.find_by("title_multiloc->>'fr-FR' = 'Espaces verts'") }

      it 'lays out the proposals component on the timeline and the survey as a standalone (parallel) phase' do
        # Steps are dropped; only proposals (ideation) and survey (native_survey) become phases.
        # (The page component becomes a static page.)
        ideation = project.phases.find_by(participation_method: 'ideation')
        survey = project.phases.find_by(participation_method: 'native_survey')

        # The proposals phase sits on the timeline, dated from the component to its last proposal.
        expect(ideation.placement_type).to eq('on_timeline')
        expect([ideation.start_at.to_date.iso8601, ideation.end_at.to_date.iso8601]).to eq(%w[2023-01-05 2023-02-25])
        # The survey runs standalone (parallel), keeping its own window instead of being pushed after the
        # proposals — so it overlaps them rather than distorting the timeline.
        expect(survey.placement_type).to eq('standalone')
        expect(survey.start_at).to be < ideation.end_at
      end

      it 'imports a Decidim page as a project-scoped static page carrying the page body' do
        page = StaticPage.find_by("title_multiloc->>'fr-FR' = 'La concertation'")
        expect(page).to be_present
        expect(page.project).to eq(project)
        expect(page.code).to eq('custom')
        expect(page.top_info_section_enabled).to be(true)
        expect(page.top_info_section_multiloc['fr-FR']).to include('Contenu de la page')
      end

      it 'imports the project description as a two-column Content Builder layout linking the static page' do
        expect(project.description_multiloc).to eq({}) # description is in the layout, not here
        layout = ContentBuilder::Layout.find_by(content_buildable: project, code: 'project_description')
        expect(layout).to be_present
        expect(layout.enabled).to be(true)
        cj = layout.craftjs_json

        # A 2-1 TwoColumn: short description + description on the left, AboutBox + page links on the right.
        two_col = cj.values.find { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'TwoColumn' }
        expect(two_col['props']['columnLayout']).to eq('2-1')
        left_nodes = cj[two_col['linkedNodes']['left']]['nodes'].map { |id| cj[id] }
        left = left_nodes.map { |n| n['type']['resolvedName'] }
        right = cj[two_col['linkedNodes']['right']]['nodes'].map { |id| cj[id]['type']['resolvedName'] }
        # The fixture process has no subtitle, so the left column is short_description then description,
        # each its own TextMultiloc.
        expect(left).to eq(%w[TextMultiloc TextMultiloc])
        expect(left_nodes.first['props']['text']['fr-FR']).to include('Résumé') # the short_description
        expect(left_nodes.last['props']['text']['fr-FR']).to include('Concertation') # the full description
        expect(right.first).to eq('AboutBox')
        expect(right).to include('PageLink')

        # The PageLink references the imported static page by its id.
        page = StaticPage.find_by("title_multiloc->>'fr-FR' = 'La concertation'")
        page_link = cj.values.find { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'PageLink' }
        expect(page_link['props']['pageId']).to eq(page.id)
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

      it 'titles the survey phase by the component name and renders the questionnaire into its description' do
        survey_phase = project.phases.find_by(participation_method: 'native_survey')
        # Phase title from the component `name`, not the questionnaire title.
        expect(survey_phase.title_multiloc['fr-FR']).to eq('Questionnaire')
        # The questionnaire title becomes an <h2> heading above its description.
        expect(survey_phase.description_multiloc['fr-FR'])
          .to eq('<h2>Mon questionnaire</h2><p>Description du questionnaire</p>')
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

      it 'imports survey answers as native_survey response ideas with encoded custom_field_values' do
        survey_phase = project.phases.find_by(participation_method: 'native_survey')
        responses = Idea.where(creation_phase: survey_phase).order(:created_at)
        expect(responses.count).to eq(2)

        # The responses must be reachable through `Phase#ideas` (the ideas_phases join) — that's what
        # the survey results generator reads — not just via `creation_phase`.
        expect(survey_phase.ideas).to match_array(responses)

        first = responses.first
        expect(first.author&.unique_code).to eq('decidim-user-1')
        # Dates come from the answer row, not the import time (submitted_at would otherwise be today).
        expect(first.created_at.to_date.iso8601).to eq('2022-11-16')
        expect(first.submitted_at.to_date.iso8601).to eq('2022-11-16')
        expect(first.custom_field_values['field_10']).to eq('Bonjour le monde')
        expect(first.custom_field_values['field_11']).to eq('option_100') # single choice → one option key
        expect(first.custom_field_values['field_12']).to match_array(%w[option_102 option_103]) # multiple choice
        expect(first.custom_field_values['field_13']).to eq('Une reponse detaillee')

        # An answer whose author wasn't imported still becomes a response, just author-less (not anonymous).
        anonymous = responses.last
        expect(anonymous.author).to be_nil
        expect(anonymous.anonymous).to be(false)
        expect(anonymous.custom_field_values['field_10']).to eq('Reponse sans auteur connu')
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

      it 'imports proposal follows as followers on the idea, skipping follows by non-imported users' do
        idea = Idea.find_by(title_multiloc: { 'fr-FR' => "Plus d'arbres" })
        user2 = User.find_by(unique_code: 'decidim-user-2')

        followers = Follower.where(followable: idea)
        # The follow by the unconfirmed (unimported) decidim-user-131 is skipped; only user-2 remains.
        expect(followers.map(&:user)).to contain_exactly(user2)
        expect(followers.first.created_at.to_date.iso8601).to eq('2023-03-11')
      end

      it 'imports proposal endorsements as up-reactions (likes) on the idea, keeping author-less ones' do
        idea = Idea.find_by(title_multiloc: { 'fr-FR' => "Plus d'arbres" })
        user2 = User.find_by(unique_code: 'decidim-user-2')

        reactions = Reaction.where(reactable: idea)
        expect(reactions.map(&:mode).uniq).to eq(['up'])
        # user-2's like + the unconfirmed decidim-user-131's like (kept author-less), so the count is 2.
        expect(reactions.map(&:user)).to contain_exactly(user2, nil)
        expect(idea.reload.likes_count).to eq(2)
      end

      it 'imports comment votes as up/down-reactions on the comments, keeping author-less ones' do
        thread = Idea.find_by(title_multiloc: { 'fr-FR' => "Plus d'arbres" }).comments.order(:created_at)
        commented = thread.first  # comment--1
        replied = thread.last     # comment--2
        user2 = User.find_by(unique_code: 'decidim-user-2')
        user3 = User.find_by(unique_code: 'decidim-user-3')

        up = Reaction.where(reactable: commented)
        expect(up.map(&:mode).uniq).to eq(['up'])
        # user-3's like + the unconfirmed decidim-user-131's like (kept author-less), so the count is 2.
        expect(up.map(&:user)).to contain_exactly(user3, nil)
        expect(commented.reload.likes_count).to eq(2)

        down = Reaction.where(reactable: replied)
        expect(down.map { |r| [r.mode, r.user] }).to contain_exactly(['down', user2])
        expect(replied.reload.dislikes_count).to eq(1)
      end

      it 'imports Decidim categories as the project input topics, preserving hierarchy' do
        topics = InputTopic.where(project: project)
        env = topics.find_by("title_multiloc->>'fr-FR' = 'Environnement'")
        arbres = topics.find_by("title_multiloc->>'fr-FR' = 'Arbres'")

        expect(topics.count).to eq(2)
        expect(env.description_multiloc['fr-FR']).to include('Cat env')
        expect(arbres.parent).to eq(env) # the Decidim parent/child hierarchy is preserved

        # The proposal's category tags its idea via ideas_input_topics.
        idea = Idea.find_by(title_multiloc: { 'fr-FR' => "Plus d'arbres" })
        expect(idea.input_topics).to contain_exactly(arbres)
      end

      it 'imports the admin answer as official feedback and the comment thread' do
        accepted = Idea.find_by(title_multiloc: { 'fr-FR' => "Plus d'arbres" })
        feedback = accepted.official_feedbacks.first
        expect(feedback.body_multiloc['fr-FR']).to include('acceptée')

        thread = accepted.comments.order(:created_at)
        expect(thread.size).to eq(2)
        expect(thread.last.parent).to eq(thread.first)

        # A comment whose Decidim author was filtered out is imported author-less.
        rejected = Idea.find_by(title_multiloc: { 'fr-FR' => 'Pistes cyclables' })
        expect(rejected.comments.first.author).to be_nil
      end

      it 'imports proposal notes as private internal comments on the idea' do
        accepted = Idea.find_by(title_multiloc: { 'fr-FR' => "Plus d'arbres" })

        note = accepted.internal_comments.first
        expect(note.body).to include('Needs legal review')
        expect(note.publication_status).to eq('published')
        expect(note.author).to eq(User.find_by(unique_code: 'decidim-user-2'))
        # Dated from the export, not the import run.
        expect(note.created_at.to_date.iso8601).to eq('2023-02-13')
      end

      it 'imports the proposal’s geocoded address as a location description and map pin' do
        accepted = Idea.find_by(title_multiloc: { 'fr-FR' => "Plus d'arbres" })

        expect(accepted.location_description).to eq('12 avenue Roger Salengro')
        expect(accepted.location_point.x).to be_within(0.00001).of(4.880)  # longitude
        expect(accepted.location_point.y).to be_within(0.00001).of(45.766) # latitude
      end

      it 'dates imported content from the export, not the import run' do
        accepted = Idea.find_by(title_multiloc: { 'fr-FR' => "Plus d'arbres" })

        # The proposal idea is dated by its publication; updated_at mirrors it (no source edit date).
        expect(accepted.created_at.to_date.iso8601).to eq('2023-02-10')
        expect(accepted.updated_at.to_date.iso8601).to eq('2023-02-10')

        # Official feedback is dated by when the proposal was answered, not today; updated_at mirrors it.
        feedback = accepted.official_feedbacks.first
        expect(feedback.created_at.to_date.iso8601).to eq('2023-03-01')
        expect(feedback.updated_at.to_date.iso8601).to eq('2023-03-01')

        # A comment keeps the export's own (distinct) updated_at — an edit date, not today.
        comment = accepted.comments.order(:created_at).first
        expect(comment.created_at.to_date.iso8601).to eq('2023-02-11')
        expect(comment.updated_at.to_date.iso8601).to eq('2023-02-14')
      end
    end

    context 'with a process that has a budgets component' do
      before { described_class.from_directory(export_root, import_uploads: false).import }

      let(:project) { Project.find_by("title_multiloc->>'fr-FR' = 'Budget participatif'") }
      let(:phase) { project.phases.find_by(participation_method: 'voting') }

      it 'imports the budgets component as a budgeting voting phase dated from the orders' do
        expect(phase.voting_method).to eq('budgeting')
        expect(phase.voting_max_total).to eq(100_000) # the budget's total_budget
        # Dated from the first/last order (2024-06-01 → 2024-06-02), not the component's publication.
        expect(phase.start_at.to_date.iso8601).to eq('2024-06-01')
        expect(phase.end_at.to_date.iso8601).to eq('2024-06-02')
      end

      it 'imports budget projects as ideas in the phase, carrying their budget' do
        aire = Idea.find_by(title_multiloc: { 'fr-FR' => 'Terrain multisport' })
        fontaine = Idea.find_by(title_multiloc: { 'fr-FR' => 'Fontaine à boire' })

        expect(aire.budget).to eq(30_000)
        expect(aire.location_description).to eq('12 rue des Écoles')
        # The budget project's coordinates become the idea's map pin ([lon, lat]).
        expect(aire.location_point.x).to be_within(0.00001).of(4.889)
        expect(aire.location_point.y).to be_within(0.00001).of(45.771)
        expect(aire.phases).to include(phase)
        expect(fontaine.budget).to eq(20_000)
      end

      it 'imports orders as baskets (checked_out_at → submitted_at) with a vote per pick' do
        user2 = User.find_by(unique_code: 'decidim-user-2')
        basket = Basket.find_by(phase: phase, user: user2)
        aire = Idea.find_by(title_multiloc: { 'fr-FR' => 'Terrain multisport' })

        expect(basket.submitted_at).to eq(Time.zone.parse('2024-06-01 10:00:00 +0200'))
        # user-2's basket picks both projects; votes are the ideas' budgets (30000 + 20000).
        expect(basket.baskets_ideas.sum(:votes)).to eq(50_000)
        expect(basket.ideas).to include(aire)
      end

      it 'recomputes the phase and idea basket/vote counts from the submitted baskets' do
        aire = Idea.find_by(title_multiloc: { 'fr-FR' => 'Terrain multisport' })
        fontaine = Idea.find_by(title_multiloc: { 'fr-FR' => 'Fontaine à boire' })

        # Only the two submitted (finished) orders become baskets; the pending order is not imported at all.
        expect(phase.baskets.count).to eq(2)
        expect(phase.reload.baskets_count).to eq(2)
        expect(phase.votes_count).to eq(80_000) # 50000 + 30000
        # Aire de jeux is picked in both submitted baskets; Fontaine only in one (its other pick was pending).
        expect(aire.reload.baskets_count).to eq(2)
        expect(aire.votes_count).to eq(60_000)
        expect(fontaine.reload.baskets_count).to eq(1)
        expect(fontaine.votes_count).to eq(20_000)
      end
    end

    context 'with a proposals component whose proposals were voted on' do
      before { described_class.from_directory(export_root, import_uploads: false).import }

      let(:project) { Project.find_by("title_multiloc->>'fr-FR' = 'Budget des rues'") }
      let(:phase) { project.phases.sole }
      let(:rue_a) { Idea.find_by(title_multiloc: { 'fr-FR' => 'Rénover la rue A' }) }
      let(:rue_b) { Idea.find_by(title_multiloc: { 'fr-FR' => 'Rénover la rue B' }) }

      it 'imports the component as a single-voting phase respecting the vote limit' do
        expect(phase.participation_method).to eq('voting')
        expect(phase.voting_method).to eq('single_voting')
        expect(phase.voting_max_votes_per_idea).to eq(1) # one vote per option
        expect(phase.voting_max_total).to eq(2) # the component's vote_limit
      end

      it 'imports the voted proposals as ideas in the voting phase' do
        expect(rue_a.phases).to include(phase)
        expect(rue_b.phases).to include(phase)
        # The proposals keep their Decidim status (resolved to an ideation idea_status), as for any proposal.
        expect(rue_a.idea_status.code).to eq('accepted')
      end

      it 'imports each voter’s votes as one submitted basket, a single vote per picked idea' do
        user1 = User.find_by(unique_code: 'decidim-user-1')
        basket = Basket.find_by(phase: phase, user: user1)

        # user-1 voted for both streets; the basket is dated by the last vote and holds one vote per idea.
        expect(basket.submitted_at).to eq(Time.zone.parse('2022-09-03 10:30:00 +0200'))
        expect(basket.ideas).to contain_exactly(rue_a, rue_b)
        expect(basket.baskets_ideas.pluck(:votes)).to eq([1, 1])
      end

      it 'recomputes the phase and idea vote counts from the submitted baskets' do
        # Three voters (user-1/2/3), so three submitted baskets and five votes (3 for rue A, 2 for rue B).
        expect(phase.reload.baskets_count).to eq(3)
        expect(phase.votes_count).to eq(5)
        expect(rue_a.reload.votes_count).to eq(3)
        expect(rue_b.reload.votes_count).to eq(2)
      end
    end

    context 'with processes that have meetings and blogs components' do
      before { described_class.from_directory(export_root, import_uploads: false).import }

      it 'imports a meeting as a project event with its window, address and map pin' do
        event = Event.find_by(title_multiloc: { 'fr-FR' => 'Atelier de quartier' })

        expect(event.project.title_multiloc['fr-FR']).to eq('Espaces verts')
        expect(event.description_multiloc['fr-FR']).to eq('<p>Venez discuter des espaces verts</p>')
        expect(event.location_multiloc['fr-FR']).to eq('Salle du Conseil')
        expect(event.address_1).to eq('10 av Paul Doumer, 94110 Arcueil')
        expect(event.start_at).to eq(Time.zone.parse('2024-04-25 18:30:00 +0200'))
        expect(event.end_at).to eq(Time.zone.parse('2024-04-25 20:00:00 +0200'))
        expect(event.attendees_count).to eq(42)
        # The map pin is set from the meeting's lat/lng (GeoJSON is longitude-first).
        expect(event.location_point.x).to be_within(0.00001).of(2.33714)  # longitude
        expect(event.location_point.y).to be_within(0.00001).of(48.80633) # latitude
      end

      it 'imports a blog post as a project static page linked in the description’s Blog section' do
        page = StaticPage.find_by("title_multiloc->>'fr-FR' = 'Végétalisation du toit de la mairie'")
        expect(page.code).to eq('custom')
        expect(page.top_info_section_multiloc['fr-FR']).to include('îlot de fraicheur')

        project = Project.find_by("title_multiloc->>'fr-FR' = 'Budget participatif'")
        layout = ContentBuilder::Layout.find_by(content_buildable: project, code: 'project_description')
        page_links = layout.craftjs_json.values
          .select { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'PageLink' }
          .map { |n| n['props']['pageId'] }
        expect(page_links).to include(page.id)
        headings = layout.craftjs_json.values.filter_map { |n| n.dig('props', 'text', 'fr-FR') }
        expect(headings).to include(a_string_including("<h2>#{I18n.t('decidim_importer.blog', locale: 'fr-FR')}</h2>"))
      end

      it 'imports a meeting attachment as an event file attachment, owned by the event’s project' do
        template = described_class.from_directory(export_root).build_template.models['models']

        file = template['files/file'].find { |f| f['name'] == 'Flyer atelier.pdf' }
        expect(file).to be_present
        event = template['event'].find { |e| e['title_multiloc']['fr-FR'] == 'Atelier de quartier' }
        attachment = template['files/file_attachment'].find { |fa| fa['file_ref'].equal?(file) }
        expect(attachment['attachable_ref']).to be(event)
        expect(template['files/files_project'].find { |fp| fp['file_ref'].equal?(file) }).to be_present
      end
    end
  end

  describe '#import (re-import safety)' do
    it 'imports areas even when the tenant already has areas (no ordering collision)' do
      create(:area) # pre-existing area occupying an ordering
      expect { described_class.from_directory(export_root, import_uploads: false).import }.not_to raise_error
      expect(Area.find_by("title_multiloc->>'en' = 'Schambergerton'")).to be_present
    end
  end
end
