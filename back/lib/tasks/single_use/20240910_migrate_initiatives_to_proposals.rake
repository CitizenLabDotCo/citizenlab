namespace :initiatives_to_proposals do
  desc 'Replace the Citizenlab default moderator with Go Vocal attributes.'
  task :migrate_proposals, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      next if !config.feature_activated?('initiatives') && !Initiative.exists?

      project = rake_20240910_create_proposals_project(reporter)
      next if !project

      rake_20240910_substitute_homepage_element(project, reporter)
      rake_20240910_replace_navbaritem(project, reporter)
      rake_20240910_migrate_input_statuses(reporter) # Overwrite the input status descriptions
      map_initiatives_to_proposals = {}
      Initiative.where.not(publication_status: 'draft').each do |initiative|
        proposal_attributes = rake_20240910_proposal_attributes(initiative, project)
        proposal = Idea.new proposal_attributes
        next if !rake_20240910_assign_idea_status(proposal, initiative, reporter)

        rake_20240910_assign_publication(proposal, initiative)
        if proposal.save
          map_initiatives_to_proposals[initiative.id] = proposal.id
          reporter.add_create(
            'Proposal',
            proposal_attributes,
            context: { tenant: tenant.host, initiative: initiative.id }
          )
        else
          reporter.add_error(
            proposal.errors.details,
            context: { tenant: tenant.host, initiative: initiative.id }
          )
          next
        end
        rake_20240910_migrate_images_files(proposal, reporter) # Idea images, idea files and text images (header background is not migrated)
        rake_20240910_migrate_topics(proposal, reporter)
        rake_20240910_migrate_reactions(proposal, reporter)
        rake_20240910_migrate_comments(proposal, reporter) # Including internal comments
        rake_20240910_migrate_official_feedback(proposal, reporter)
        rake_20240910_migrate_followers(proposal, reporter)
        rake_20240910_migrate_spam_reports(proposal, reporter)
        rake_20240910_migrate_cosponsors(proposal, reporter)
        # Should we also migrate notifications?
      end
      rake_20240910_migrate_initiatives_static_page(reporter)
      SettingsService.new.deactivate_feature!('initiatives')
    end
    reporter.report!('migrate_initiatives_to_proposals.json', verbose: true)
  end
end

task :migrate_proposals, [] => [:environment] do
  Tenant.safe_switch_each do |tenant|
    Project.find_by(slug: 'proposals')&.destroy
    SettingsService.new.activate_feature!('initiatives')
  end
end

def rake_20240910_create_proposals_project(reporter)
  config = AppConfiguration.instance
  project = Project.new(
    title_multiloc: rake_20240910_migrate_project_title_multiloc,
    description_multiloc: {}, # Include all locales app.containers.InitiativesIndexPage.explanationContent app.containers.InitiativesIndexPage.learnMoreAboutProposals
    slug: 'proposals' # Does this work if there is already a project with this slug?
    # Include more project attributes
  )
  project.admin_publication_attributes = { publication_status: 'archived' } if !config.feature_activated?('initiatives')
  # Set visibility and granular permissions according to the permissions for initiatives
  if !project.save
    reporter.add_error(
      project.errors.details,
      context: { tenant: config.host, project: project.id }
    )
    return false
  end
  phase = Phase.new(
    project: project,
    title_multiloc: MultilocService.new.i18n_to_multiloc('nav_bar_items.proposals.title', locales: CL2_SUPPORTED_LOCALES),
    start_at: config.created_at,
    end_at: nil,
    participation_method: 'proposals',
    expire_days_limit: config.settings('initiatives', 'days_limit'),
    reacting_threshold: config.settings('initiatives', 'reacting_threshold'),
    prescreening_enabled: config.feature_activated?('initiative_review'),
    campaigns_settings: { project_phase_started: true }
    # Include cosponsorship settings
    # Include more phase attributes
  )
  if !phase.save
    reporter.add_error(
      phase.errors.details,
      context: { tenant: config.host, phase: phase.id }
    )
    return false
  end
  project
end

def rake_20240910_substitute_homepage_element(project, reporter)
  homepage = ContentBuilder::Layout.find_by(code: 'homepage')
  return if !homepage

  homepage.craftjs_json.map_values! do |element|
    next element if element.dig('type', 'resolvedName') != 'Proposals'

    {
      'type' => { 'resolvedName' => 'Highlight' },
      'nodes' => [],
      "props": {
          'title' => {
              'en' => 'What is your proposal?' # app.containers.landing.initiativesBoxTitle
          },
          'description' => {
              'en' => 'Post your proposal on this platform. Blablabla.' # app.containers.landing.initiativesBoxText
          },
          'primaryButtonLink' => "/projects/#{project.slug}ideas/new?phase_id=#{project.phases.first.id}",
          'primaryButtonText' => {
              'en' => 'Post your proposal'
          },
          'secondaryButtonLink' => "/projects/#{project.slug}",
          'secondaryButtonText' => {
              'en' => 'Explore all proposals'
          }
      },
      'custom' => {
          'title' => {
              'id' => 'app.containers.admin.ContentBuilder.homepage.highlight.highlightTitle',
              'defaultMessage' => 'Highlight'
          },
          'noPointerEvents' => true
      },
      'hidden' => false,
      'parent' => 'ROOT',
      'isCanvas' => false,
      'displayName' => 'Highlight',
      'linkedNodes' => {}
    }
  end
end

def rake_20240910_replace_navbaritem(project, reporter)
  item = NavBarItem.find_by(code: 'proposals')
  return if !item

  item.assign_attributes(
    code: 'custom',
    project_id: project.id
  )
  if !item.save
    reporter.add_error(
      item.errors.details,
      context: { tenant: tenant.host, nav_bar_item: item.id }
    )
  end
end

def rake_20240910_proposal_attributes(initiative, project)
  proposals_phase = project.phases.first
  # Do we want to preserve the slug?
  {
    title_multiloc: initiative.title_multiloc,
    body_multiloc: initiative.body_multiloc,
    publication_status: initiative.publication_status,
    published_at: initiative.published_at,
    author_id: initiative.author_id,
    created_at: initiative.created_at,
    updated_at: initiative.updated_at,
    location_point_geojson: initiative.location_point_geojson,
    location_description: initiative.location_description,
    assignee_id: initiative.assignee_id,
    assigned_at: initiative.assigned_at,
    author_hash: initiative.author_hash,
    anonymous: initiative.anonymous,
    submitted_at: (initiative.published_at || initiative.created_at),
    project: initiative.project,
    creation_phase: proposals_phase,
    phases: [proposals_phase]
  }
end

def rake_20240910_assign_idea_status(proposal, initiative, reporter)
  code = initiative.initiative_status.code
  status = IdeaStatus.find_by(code: code, participation_method: 'proposals')
  if status
    proposal.idea_status = status
    return true
  elsif %w[review_pending changes_requested].include?(code)
    proposal.idea_status = IdeaStatus.find_by(code: 'prescreening', participation_method: 'proposals')
    return true
  else
    reporter.add_error(
      "No matching input status found for code #{code}",
      context: { tenant: tenant.host, initiative: initiative.id, input_status_code: code }
    )
    return false
  end
end

def rake_20240910_assign_publication(proposal, initiative)
  if proposal.idea_status.public_post?
    proposal.publication_status = 'published'
    proposal.published_at = initiative.proposed_at
  else
    proposal.publication_status = 'submitted'
    proposal.submitted_at = initiative.created_at
  end
end

def rake_20240910_migrate_initiatives_static_page(reporter)
  page = StaticPage.find_by(slug: 'proposals')
  return if !page

  if !page.update(code: 'custom')
    reporter.add_error(
      page.errors.details,
      context: { tenant: tenant.host, static_page: page.id }
    )
  end
end

def rake_20240910_migrate_project_title_multiloc
  multiloc = {
    "ar-MA" => "انشر مُقترحك هنا وضعه على جدول أعمال {styledOrgName}",
    "ar-SA" => "انشر مُقترحك هنا وضعه على جدول أعمال {styledOrgName}",
    "ca-ES" => "Publiqueu la vostra proposta aquí i col·loqueu-la a l'agenda de {styledOrgName}",
    "cy-GB" => "Postiwch eich cynnig yma a'i roi ar agenda {styledOrgName}",
    "da-DK" => "Aflever dit forslag her og sæt det på dagsordenen hos {styledOrgName}",
    "de-DE" => "Veröffentliche deinen Vorschlag hier und setze ihn auf die Tagesordnung von {styledOrgName}",
    "el-GR" => "Δημοσιεύστε την πρότασή σας εδώ και βάλτε την στην ημερήσια διάταξη του {styledOrgName}",
    "en-CA" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "en-GB" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "en-IE" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "en" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "es-CL" => "Sube aquí tu propuesta e instálala en la agenda de {styledOrgName}",
    "es-ES" => "Sube aquí tu propuesta e instálala en la agenda de {styledOrgName}",
    "fi-FI" => "Lähetä ehdotuksesi tähän ja laita se {styledOrgName}esityslistalle",
    "fr-BE" => "Postez votre proposition ici et récoltez du soutien pour la mettre à l’agenda",
    "fr-FR" => "Postez votre proposition ici et récoltez du soutien pour la mettre à l’agenda",
    "hr-HR" => "Objavite svoj prijedlog i stavite ga na dnevni red {styledOrgName}",
    "hu-HU" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "it-IT" => "Pubblica qui la tua proposta e mettila all'ordine del giorno di {styledOrgName}",
    "kl-GL" => "Siunnersuutit uunga allaguk, uanilu {styledOrgName} oqaluuserisassanngortillugu",
    "lb-LU" => "Verëffentlecht Äre Virschlag hei a setzt en op d’Agenda vum {styledOrgName}",
    "lv-LV" => "Publicējiet šeit savu priekšlikumu un iekļaujiet to {styledOrgName} darba kārtībā",
    "mi" => "Post your proposal here and place it on the agenda of {styledOrgName}",
    "nb-NO" => "Publiser ideen din her og sett det på agendaen til {styledOrgName}",
    "nl-BE" => "Plaats je voorstel hier en breng het op de agenda van {styledOrgName}",
    "nl-NL" => "Plaats je voorstel hier en breng het op de agenda van {styledOrgName}",
    "pl-PL" => "Opublikuj swoją propozycję tutaj i umieść ją w porządku dziennym {styledOrgName}",
    "pt-BR" => "Publique aqui a sua proposta e coloque-a na agenda de {styledOrgName}",
    "ro-RO" => "Postează aici propunerea ta și pune-o pe ordinea de zi a {styledOrgName}",
    "sr-Latn" => "Postavite vaš predlog i uputite ga na razmatranje ka {styledOrgName}",
    "sr-SP" => "Поставите свој предлог овде и ставите га на дневни ред {styledOrgName}",
    "sv-SE" => "Publicera ditt förslag här och sätt upp det på dagordningen för {styledOrgName}",
    "tr-TR" => "Önerinizi burada yayınlayın ve {styledOrgName} gündemine taşıyın"
  }
  case AppConfiguration.instance.name
  when 'KøbenhavnsKommune'
    multiloc['da-DK'] = 'Hvad er dit københavnerforslag?'
  when 'HolbækKommune'
    multiloc['da-DK'] = 'Opret dit forslag her og sæt det på dagsordenen hos Holbæk Kommune'
  end
  multiloc.to_h do |key, value|
    org_name = Locale.new(key).resolve_multiloc(AppConfiguration.instance.settings('core', 'organization_name'))
    [key, value.gsub('{styledOrgName}', org_name)]
  end
end
