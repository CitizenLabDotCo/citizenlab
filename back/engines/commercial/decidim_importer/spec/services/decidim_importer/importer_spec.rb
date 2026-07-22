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

    it 'imports a process\'s attachments as Files engine files owned by (but not attached to) the project' do
      template = described_class.from_directory(export_root).build_template.models['models']

      # The file name is the URL's decoded basename, with its extension preserved.
      process_files = template['files/file']
        .select { |f| f['name'].in?(['Compte-rendu réunion.pdf', "Plan d'actions.pdf"]) }
      expect(process_files.size).to eq(2)
      expect(process_files.map { |f| f['remote_content_url'] })
        .to all(start_with('http://example.org/files/redirect/'))

      # Each file is owned by a project (files_project) so it's available and linkable from the
      # description — but the *process* files are not surfaced as attachments (no file_attachment).
      expect(template['files/files_project'].map { |fp| fp['project_ref'] }).to all(be_present)
      attached_names = (template['files/file_attachment'] || []).map { |fa| fa['file_ref']['name'] }
      expect(attached_names).not_to include('Compte-rendu réunion.pdf', "Plan d'actions.pdf")
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
      importer = described_class.from_directory(export_root)
      template = importer.build_template.models['models']
      map = importer.link_map

      espaces = template['project'].find { |p| p['title_multiloc']['fr-FR'] == 'Espaces verts' }
      file = importer.ref_map.records
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
      # Steps aren't imported as phases; this process's accountability component is its one ideation phase.
      expect(project.phases.pluck(:participation_method)).to eq(['ideation'])

      # Decidim scopes become flat Go Vocal areas.
      expect(Area.find_by("title_multiloc->>'en' = 'Schambergerton'")).to be_present
    end

    it 'provisions a project_page layout wrapping the imported description, so the project page renders' do
      described_class.from_directory(export_root, import_images: false).import
      project = Project.find_by("title_multiloc->>'fr-FR' = 'Espaces verts'")

      # The page now renders from a `project_page` layout (generated from the `project_description`
      # layout the importer built); without it the project page endpoint 404s.
      page = ContentBuilder::Layout.find_by(content_buildable: project, code: 'project_page')
      expect(page).to be_present
      expect(page.enabled).to be(true)
      expect(page.craftjs_json.dig('ROOT', 'type', 'resolvedName')).to eq('ProjectPageRoot')

      # The imported description was injected into the page's description section.
      section = page.craftjs_json.values
        .find { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'ProjectDescriptionSection' }
      expect(section['nodes']).not_to be_empty
    end

    it 'imports an accountability component as an ideation phase, with its results as ideas carrying a progress line' do
      described_class.from_directory(export_root, import_images: false).import
      project = Project.find_by("title_multiloc->>'fr-FR' = 'Rue de demain'")

      phase = project.phases.sole
      expect(phase.participation_method).to eq('ideation')
      expect(phase.title_multiloc['fr-FR']).to eq('Suivi') # titled by the component name

      idea = Idea.find_by(title_multiloc: { 'fr-FR' => 'Nouvelle place' })
      expect(idea.phases).to include(phase)
      expect(idea.author).to be_nil # results have no author
      # A bulleted Progress + Status (name - description) block is prepended to the description. (Loose
      # includes: the idea-body sanitiser inserts newlines between the list tags on save.)
      body = idea.body_multiloc['fr-FR']
      expect(body).to include('<strong>Progress:</strong> 100% ') # the space after % survives sanitisation
      expect(body).to include('<strong>Status:</strong> Réalisé - Projet terminé')
      expect(body).to include('Une place rénovée')

      # A result at 40% maps to the 40% status.
      other = Idea.find_by(title_multiloc: { 'fr-FR' => 'Étude en cours' })
      expect(other.body_multiloc['fr-FR']).to include("<strong>Status:</strong> À l'étude - En cours d'étude")
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

      it 'lays out the proposals and survey components as phases ordered by component weight' do
        # Steps are dropped; only proposals (ideation) and survey (native_survey) become phases. They're
        # ordered by component weight (proposals weight 0, survey weight 7), and the survey — which
        # overlapped — is pushed after the proposals to fit. (The page component becomes a static page.)
        methods = project.phases.order(:start_at).pluck(:participation_method)
        expect(methods).to eq(%w[ideation native_survey])
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
      before { described_class.from_directory(export_root, import_images: false).import }

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

        # Two submitted baskets (the pending order is created but excluded from counts).
        expect(phase.reload.baskets_count).to eq(2)
        expect(phase.votes_count).to eq(80_000) # 50000 + 30000
        # Aire de jeux is picked in both submitted baskets; Fontaine only in one (the other pick is pending).
        expect(aire.reload.baskets_count).to eq(2)
        expect(aire.votes_count).to eq(60_000)
        expect(fontaine.reload.baskets_count).to eq(1)
        expect(fontaine.votes_count).to eq(20_000)
      end
    end

    context 'with processes that have meetings and blogs components' do
      before { described_class.from_directory(export_root, import_images: false).import }

      it 'imports a meeting as a project event with its window, address and map pin' do
        event = Event.find_by(title_multiloc: { 'fr-FR' => 'Atelier de quartier' })

        expect(event.project.title_multiloc['fr-FR']).to eq('Espaces verts')
        expect(event.description_multiloc['fr-FR']).to eq('<p>Venez discuter des espaces verts</p>')
        expect(event.location_multiloc['fr-FR']).to eq('Salle du Conseil')
        expect(event.address_1).to eq('10 av Paul Doumer, 94110 Arcueil')
        expect(event.start_at).to eq(Time.zone.parse('2024-04-25 18:30:00 +0200'))
        expect(event.end_at).to eq(Time.zone.parse('2024-04-25 20:00:00 +0200'))
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

        file = template['files/file'].find { |f| f['name'] == 'flyer-atelier.pdf' }
        expect(file).to be_present
        event = template['event'].find { |e| e['title_multiloc']['fr-FR'] == 'Atelier de quartier' }
        attachment = template['files/file_attachment'].find { |fa| fa['file_ref'].equal?(file) }
        expect(attachment['attachable_ref']).to be(event)
        expect(template['files/files_project'].find { |fp| fp['file_ref'].equal?(file) }).to be_present
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
      allow(described_class).to receive(:image_importable?).with('http://live/ok.png').and_return(true)
      allow(described_class).to receive(:image_importable?).with('http://dead/gone.png').and_return(false)
      template = { 'models' => { 'idea' => [{
        'body_multiloc' => { 'fr-FR' => '<p>A</p><img src="http://live/ok.png"><img src="http://dead/gone.png"><p>B</p>' }
      }] } }

      described_class.prune_unreachable_embedded_images!(template)

      expect(template['models']['idea'].first['body_multiloc']['fr-FR'])
        .to eq('<p>A</p><img src="http://live/ok.png"><p>B</p>')
    end

    it 'leaves base64 images untouched and probes each distinct url only once' do
      allow(described_class).to receive(:image_importable?).and_return(true)
      template = { 'models' => { 'idea' => [
        { 'body_multiloc' => { 'fr-FR' => '<img src="http://x/a.png"><img src="data:image/png;base64,AAAA">' } },
        { 'body_multiloc' => { 'en' => '<img src="http://x/a.png">' } }
      ] } }

      described_class.prune_unreachable_embedded_images!(template)

      expect(template['models']['idea'].first['body_multiloc']['fr-FR']).to include('data:image/png;base64,AAAA')
      expect(described_class).to have_received(:image_importable?).once # memoised across records/locales
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

    it 'strips the FileAttachment craft node of a pruned file from the project-description layout' do
      gone = { 'id' => 'f-gone', 'name' => 'gone.pdf' } # content URL was stripped/pruned
      kept = { 'id' => 'f-kept', 'name' => 'kept.pdf', 'remote_content_url' => 'http://x/k.pdf' }
      craftjs = {
        'ROOT' => { 'type' => 'div', 'nodes' => %w[file0 file1] },
        'file0' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => 'f-gone' } },
        'file1' => { 'type' => { 'resolvedName' => 'FileAttachment' }, 'props' => { 'fileId' => 'f-kept' } }
      }
      template = { 'models' => {
        'files/file' => [gone, kept],
        'content_builder/layout' => [{ 'craftjs_json' => craftjs }]
      } }

      described_class.prune_fileless_attachments!(template)

      expect(craftjs).not_to have_key('file0')
      expect(craftjs).to have_key('file1')
      expect(craftjs['ROOT']['nodes']).to eq(['file1'])
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

  describe '.image_importable?' do
    # PNG / JPEG magic bytes for sniffing the real content type.
    let(:png_bytes) { "\x89PNG\r\n\x1a\n\x00\x00\x00\x0DIHDR".b }
    let(:jpeg_bytes) { "\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01".b }

    it 'is reachable via a ranged GET even when HEAD is forbidden (presigned S3 URL)' do
      # Active Storage redirects to presigned S3 URLs signed for GET only: HEAD → 403, GET → 200.
      stub_request(:head, 'https://s3.example/file.pdf').to_return(status: 403)
      stub_request(:get, 'https://s3.example/file.pdf').to_return(status: 200)

      expect(described_class.image_importable?('https://s3.example/file.pdf')).to be(true)
    end

    it 'follows redirects to the underlying blob (206 Partial Content counts as reachable)' do
      stub_request(:get, 'https://app.example/redirect/file.pdf')
        .to_return(status: 302, headers: { 'Location' => 'https://s3.example/blob.pdf' })
      stub_request(:get, 'https://s3.example/blob.pdf').to_return(status: 206)

      expect(described_class.image_importable?('https://app.example/redirect/file.pdf')).to be(true)
    end

    it 'is false for a genuinely missing file' do
      stub_request(:get, 'https://s3.example/gone.pdf').to_return(status: 404)

      expect(described_class.image_importable?('https://s3.example/gone.pdf')).to be(false)
    end

    it 'keeps an image whose content matches its extension' do
      stub_request(:get, 'https://s3.example/logo.png').to_return(status: 200, body: png_bytes)

      expect(described_class.image_importable?('https://s3.example/logo.png')).to be(true)
    end

    it 'drops a reachable image whose content type disagrees with its extension (JPEG named .png)' do
      # This is exactly what aborts the import at exif-stripping time, so it must be pruned beforehand.
      stub_request(:get, 'https://s3.example/logo.png').to_return(status: 200, body: jpeg_bytes)

      expect(described_class.image_importable?('https://s3.example/logo.png')).to be(false)
    end

    it 'treats .jpg and .jpeg as the same format (no false conflict)' do
      stub_request(:get, 'https://s3.example/photo.jpg').to_return(status: 200, body: jpeg_bytes)

      expect(described_class.image_importable?('https://s3.example/photo.jpg')).to be(true)
    end
  end

  describe '.prune_unreachable_remote_urls!' do
    it 'drops only the remote_*_url attachments that are unreachable' do
      allow(described_class).to receive(:image_importable?).with('http://live/a.png').and_return(true)
      allow(described_class).to receive(:image_importable?).with('http://dead/b.png').and_return(false)
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
