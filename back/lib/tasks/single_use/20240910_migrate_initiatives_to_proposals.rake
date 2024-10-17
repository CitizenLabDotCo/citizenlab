namespace :initiatives_to_proposals do
  desc 'Replace the Citizenlab default moderator with Go Vocal attributes.'
  task :migrate_proposals, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      puts "Migrating initiatives to proposals for #{tenant.host}"
      reporter.add_processed_tenant(tenant)
      # next if %w[copenhagenmigrated.epic.citizenlab.co kobenhavntaler.kk.dk].exclude? tenant.host ### TODO: DELETE THIS LINE
      next if !AppConfiguration.instance.feature_activated?('initiatives') && !Initiative.exists?

      SettingsService.new.activate_feature!('input_cosponsorship') if AppConfiguration.instance.feature_activated?('initiative_cosponsors')

      project = rake_20240910_create_proposals_project(reporter)
      next if !project

      rake_20240910_substitute_homepage_element(project, reporter)
      rake_20240910_replace_navbaritem(project, reporter)
      rake_20240910_migrate_input_statuses(reporter)
      Initiative.where.not(publication_status: 'draft').each do |initiative|
        proposal_attributes = rake_20240910_proposal_attributes(initiative, project)
        proposal = Idea.new proposal_attributes
        next if !rake_20240910_assign_idea_status(proposal, initiative, reporter)

        rake_20240910_assign_publication(proposal, initiative)
        if proposal.save
          reporter.add_create(
            'Proposal',
            proposal_attributes,
            context: { tenant: tenant.host, proposal: initiative.slug }
          )
        else
          reporter.add_error(
            proposal.errors.details,
            context: { tenant: tenant.host, proposal: proposal.slug }
          )
          next
        end
        rake_20240910_migrate_activities(proposal, initiative, reporter)
        rake_20240910_migrate_images_files(proposal, initiative, reporter) ### TODO: RESTORE THIS LINE
        rake_20240910_migrate_topics(proposal, initiative, reporter)
        rake_20240910_migrate_reactions(proposal, initiative, reporter)
        rake_20240910_migrate_spam_reports(proposal, initiative, reporter)
        rake_20240910_migrate_comments(proposal, initiative, reporter)
        rake_20240910_migrate_official_feedback(proposal, initiative, reporter)
        rake_20240910_migrate_followers(proposal, initiative, reporter)
        rake_20240910_migrate_cosponsors(proposal, initiative, reporter)
      end
      rake_20240910_migrate_initiatives_static_page(reporter)
      SettingsService.new.deactivate_feature!('initiatives')
      reporter.report!("migrate_initiatives_to_proposals_#{ENV.fetch('POSTGRES_HOST')}.json", verbose: false)
    rescue ActiveRecord::StatementInvalid => e
      puts "Error occurred during migration: #{e.message}"
      reporter.add_error(e.message)
      sleep(60 * 60)
    end
    reporter.report!("migrate_initiatives_to_proposals_#{ENV.fetch('POSTGRES_HOST')}.json", verbose: true)
  end
end

task :revert_proposals, [] => [:environment] do
  Tenant.safe_switch_each do
    Project.find_by(slug: 'proposals')&.destroy
    SettingsService.new.activate_feature!('initiatives')
  end
end

def rake_20240910_create_proposals_project(reporter)
  config = AppConfiguration.instance
  project = Project.new(
    title_multiloc: rake_20240910_migrate_project_title_multiloc,
    description_multiloc: rake_20240910_migrate_project_description_multiloc,
    slug: SlugService.new.generate_slug(Project.new, 'proposals'),
    default_assignee: User.active.admin.order(:created_at).reject(&:super_admin?).first
  )
  project.admin_publication_attributes = { publication_status: 'archived' } if !config.feature_activated?('initiatives')
  if !project.save
    reporter.add_error(
      project.errors.details,
      context: { tenant: config.host, project: project.id }
    )
    return false
  end
  project.admin_publication.move_to_bottom
  project.set_default_topics!

  phase = Phase.new(
    project: project,
    title_multiloc: MultilocService.new.i18n_to_multiloc('nav_bar_items.proposals.title', locales: CL2_SUPPORTED_LOCALES),
    start_at: config.created_at,
    end_at: nil,
    campaigns_settings: { project_phase_started: true },
    participation_method: 'proposals',
    input_term: 'proposal',
    expire_days_limit: config.settings('initiatives', 'days_limit'),
    reacting_threshold: config.settings('initiatives', 'reacting_threshold'),
    prescreening_enabled: config.feature_activated?('initiative_review')
  )
  phase[:allow_anonymous_participation] = config.settings('initiatives', 'allow_anonymous_participation') if config.settings('initiatives')&.key? 'allow_anonymous_participation'
  ParticipationMethod::Proposals.new(phase).assign_defaults_for_phase
  if !phase.save
    reporter.add_error(
      phase.errors.details,
      context: { tenant: config.host, phase: phase.id }
    )
    return false
  end

  phase.pmethod.create_default_form!
  section = phase.reload.custom_form.custom_fields.find_by(code: 'ideation_section1')
  section.description_multiloc = config.settings('initiatives', 'posting_tips').presence || MultilocService.new.i18n_to_multiloc('initiatives.default_posting_tips', locales: CL2_SUPPORTED_LOCALES)
  if !section.save
    reporter.add_error(
      section.errors.details,
      context: { tenant: config.host, section: section.id }
    )
  end

  Permissions::PermissionsUpdateService.new.update_permissions_for_scope(phase)
  phase.reload
  Permission.where(action: %w[posting_initiative commenting_initiative reacting_initiative]).each do |old_permission|
    permission_mapping = {
      'posting_initiative' => 'posting_idea',
      'commenting_initiative' => 'commenting_idea',
      'reacting_initiative' => 'reacting_idea'
    }
    new_permission = phase.permissions.find_by(action: permission_mapping[old_permission.action])
    new_permission.assign_attributes(
      permitted_by: old_permission.permitted_by,
      global_custom_fields: old_permission.global_custom_fields,
      verification_expiry: old_permission.verification_expiry,
      access_denied_explanation_multiloc: old_permission.access_denied_explanation_multiloc,
      group_ids: old_permission.group_ids
    )
    if !new_permission.save
      reporter.add_error(
        new_permission.errors.details,
        context: { tenant: config.host, permission: new_permission.action }
      )
    end
    old_permission.permissions_custom_fields.order(:ordering).each do |old_custom_field|
      new_custom_field = PermissionsCustomField.new(
        permission: new_permission,
        custom_field_id: old_custom_field.custom_field_id,
        required: old_custom_field.required
      )
      if !new_custom_field.save
        reporter.add_error(
          new_custom_field.errors.details,
          context: { tenant: config.host, permissions_custom_field: old_custom_field.id }
        )
      end
    end
  end
  project
end

def rake_20240910_substitute_homepage_element(project, reporter)
  homepage = ContentBuilder::Layout.find_by(code: 'homepage')
  return if !homepage

  homepage.craftjs_json.transform_values! do |element|
    next element unless element['type'].is_a?(Hash) && element.dig('type', 'resolvedName') == 'Proposals'

    {
      'type' => { 'resolvedName' => 'Highlight' },
      'nodes' => [],
      'props' => {
        'title' => rake_20240910_migrate_homepage_title_multiloc,
        'description' => rake_20240910_migrate_homepage_description_multiloc,
        'primaryButtonLink' => "/projects/#{project.slug}",
        'primaryButtonText' => rake_20240910_migrate_homepage_explore_multiloc,
        'secondaryButtonLink' => '',
        'secondaryButtonText' => {}
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
  if !homepage.save
    reporter.add_error(
      homepage.errors.details,
      context: { tenant: AppConfiguration.instance.host, homepage: homepage.id }
    )
  end
end

def rake_20240910_replace_navbaritem(project, reporter)
  item = NavBarItem.find_by(code: 'proposals')
  return if !item

  item.assign_attributes(
    code: 'custom',
    project_id: project.id
  )
  item.title_multiloc = MultilocService.new.i18n_to_multiloc('nav_bar_items.proposals.title', locales: CL2_SUPPORTED_LOCALES) if item.title_multiloc.blank?
  if !item.save
    reporter.add_error(
      item.errors.details,
      context: { tenant: AppConfiguration.instance.host, nav_bar_item: item.id }
    )
  end
end

def rake_20240910_migrate_input_statuses(reporter)
  new_colors = {
    'prescreening' => '#4B4B4B',
    'proposed' => '#057ABE',
    'threshold_reached' => '#008300',
    'expired' => '#B22222',
    'answered' => '#1E3A8A',
    'ineligible' => '#8B0000'
  }
  custom_titles = ['archived', 'closed', 'on hold', 'open', 'uegnet']
  IdeaStatus.where.not(code: 'custom').each do |status|
    if status.participation_method == 'proposals'
      status.title_multiloc = MultilocService.new.i18n_to_multiloc("idea_statuses.#{status.code}", locales: CL2_SUPPORTED_LOCALES)
      old_status = InitiativeStatus.find_by(code: status.code)
      status.title_multiloc.merge!(old_status.title_multiloc.select { |_, title| custom_titles.include?(title) }) if old_status
    end
    status.description_multiloc = MultilocService.new.i18n_to_multiloc("idea_statuses.#{status.code}_description", locales: CL2_SUPPORTED_LOCALES)
    new_color = new_colors[status.code]
    if new_color && (status.code != 'proposed' || status.participation_method == 'proposals' || status.color == '#687782')
      status.color = new_color
    end
    if !status.save
      reporter.add_error(
        status.errors.details,
        context: { tenant: AppConfiguration.instance.host, input_status: status.id }
      )
    end
  end
end

def rake_20240910_proposal_attributes(initiative, project)
  proposals_phase = project.phases.first
  {
    slug: SlugService.new.generate_slug(Idea.new, initiative.slug),
    title_multiloc: initiative.title_multiloc,
    body_multiloc: initiative.body_multiloc,
    author_id: initiative.author_id,
    created_at: initiative.created_at,
    updated_at: initiative.updated_at,
    location_point_geojson: initiative.location_point_geojson,
    location_description: initiative.location_description,
    assignee_id: initiative.assignee_id,
    assigned_at: initiative.assigned_at,
    author_hash: initiative.author_hash,
    anonymous: initiative.anonymous,
    submitted_at: initiative.published_at || initiative.created_at,
    project: project,
    creation_phase: proposals_phase,
    phases: [proposals_phase]
  }
end

def rake_20240910_assign_idea_status(proposal, initiative, reporter)
  code = initiative.initiative_status&.code
  status = rake_20240910_to_idea_status(initiative.initiative_status)
  if status
    proposal.idea_status = status
    true
  elsif %w[review_pending changes_requested].include?(code)
    proposal.idea_status = IdeaStatus.find_by(code: 'prescreening', participation_method: 'proposals')
    true
  else
    reporter.add_error(
      "No matching input status found for code #{code}",
      context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, input_status_code: code }
    )
    false
  end
end

def rake_20240910_to_idea_status(initiative_status)
  IdeaStatus.find_by(code: initiative_status.code, participation_method: 'proposals')
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

def rake_20240910_migrate_activities(proposal, initiative, reporter)
  previous_status_id = nil
  initiative.initiative_status_changes.order(:created_at).each do |change|
    next_status_id = rake_20240910_to_idea_status(change.initiative_status)&.id
    activity = Activity.new(
      item: proposal,
      action: 'changed_status',
      user: change.user,
      acted_at: change.created_at,
      payload: { change: [previous_status_id, next_status_id] }
    )
    previous_status_id = next_status_id
    if !activity.save
      reporter.add_error(
        activity.errors.details,
        context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, status_change: change.id }
      )
    end
  end

  initiative.activities.where(action: %w[published changed changed_title changed_body deleted]).each do |old_activity|
    new_activity = Activity.new(
      item: proposal,
      action: old_activity.action,
      user: old_activity.user,
      acted_at: old_activity.created_at,
      payload: old_activity.payload
    )
    if !new_activity.save
      reporter.add_error(
        new_activity.errors.details,
        context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, activity: old_activity.id }
      )
    end
  end
end

def rake_20240910_migrate_images_files(proposal, initiative, reporter)
  initiative.initiative_images.order(:ordering).each do |old_image|
    new_image = IdeaImage.new(
      idea: proposal,
      remote_image_url: old_image.image_url,
      created_at: old_image.created_at,
      updated_at: old_image.updated_at
    )
    if !new_image.save
      reporter.add_error(
        new_image.errors.details,
        context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, image: old_image.id }
      )
    end
  end
  initiative.initiative_files.order(:ordering).each do |old_file|
    new_file = IdeaFile.new(
      idea: proposal,
      name: old_file.name,
      remote_file_url: old_file.file_url,
      created_at: old_file.created_at,
      updated_at: old_file.updated_at
    )
    if !new_file.save
      reporter.add_error(
        new_file.errors.details,
        context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, file: old_file.id }
      )
    end
  end
  initiative.text_images.each do |text_image|
    text_image.imageable = proposal
    if !text_image.save
      reporter.add_error(
        text_image.errors.details,
        context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, text_image: text_image.id }
      )
    end
  end
end

def rake_20240910_migrate_topics(proposal, initiative, reporter)
  proposal.topics = initiative.topics
  if !proposal.save
    reporter.add_error(
      proposal.errors.details,
      context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug }
    )
  end
end

def rake_20240910_migrate_reactions(proposal, initiative, reporter)
  initiative.likes.each do |like|
    reaction = Reaction.new(
      mode: 'up',
      user_id: like.user_id,
      reactable: proposal,
      created_at: like.created_at,
      updated_at: like.updated_at
    )
    if !reaction.save
      reporter.add_error(
        reaction.errors.details,
        context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, reaction: like.id }
      )
    end
  end
end

def rake_20240910_migrate_spam_reports(proposal, initiative, reporter)
  initiative.spam_reports.each do |old_report|
    new_report = SpamReport.new(
      spam_reportable: proposal,
      user_id: old_report.user_id,
      reason_code: old_report.reason_code,
      other_reason: old_report.other_reason,
      reported_at: old_report.reported_at,
      created_at: old_report.created_at,
      updated_at: old_report.updated_at
    )
    if !new_report.save
      reporter.add_error(
        new_report.errors.details,
        context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, spam_report: old_report.id }
      )
    end
  end
end

def rake_20240910_migrate_comments(proposal, initiative, reporter)
  # There is only one internal comment, on a demo platform, so
  # skipping those.
  comment_mapping = {}
  initiative.comments.order(parent_id: :desc, created_at: :asc).each do |old_comment|
    new_comment = Comment.new(
      body_multiloc: old_comment.body_multiloc,
      publication_status: old_comment.publication_status,
      author_id: old_comment.author_id,
      author_hash: old_comment.author_hash,
      anonymous: old_comment.anonymous,
      created_at: old_comment.created_at,
      updated_at: old_comment.updated_at,
      body_updated_at: old_comment.body_updated_at,
      post: proposal
    )
    new_comment.parent_id = comment_mapping[old_comment.parent_id] if old_comment.parent_id
    if !new_comment.save
      reporter.add_error(
        new_comment.errors.details,
        context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, comment: old_comment.id }
      )
    end
    comment_mapping[old_comment.id] = new_comment.id
    old_comment.reactions.each do |reaction|
      new_reaction = Reaction.new(
        mode: reaction.mode,
        user: reaction.user,
        reactable: new_comment,
        created_at: reaction.created_at,
        updated_at: reaction.updated_at
      )
      if !new_reaction.save
        reporter.add_error(
          new_reaction.errors.details,
          context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, reaction: reaction.id }
        )
      end
    end
    old_comment.spam_reports.each do |old_report|
      new_report = SpamReport.new(
        spam_reportable: new_comment,
        user_id: old_report.user_id,
        reason_code: old_report.reason_code,
        other_reason: old_report.other_reason,
        reported_at: old_report.reported_at,
        created_at: old_report.created_at,
        updated_at: old_report.updated_at
      )
      if !new_report.save
        reporter.add_error(
          new_report.errors.details,
          context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, spam_report: old_report.id }
        )
      end
    end
  end
end

def rake_20240910_migrate_official_feedback(proposal, initiative, reporter)
  initiative.official_feedbacks.each do |old_feedback|
    new_feedback = OfficialFeedback.new(
      post: proposal,
      body_multiloc: old_feedback.body_multiloc,
      author_multiloc: old_feedback.author_multiloc,
      user_id: old_feedback.user_id,
      created_at: old_feedback.created_at,
      updated_at: old_feedback.updated_at
    )
    if !new_feedback.save
      reporter.add_error(
        new_feedback.errors.details,
        context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, official_feedback: old_feedback.id }
      )
    end
  end
end

def rake_20240910_migrate_followers(proposal, initiative, reporter)
  initiative.followers.each do |old_follower|
    new_follower = Follower.new(
      followable: proposal,
      user_id: old_follower.user_id,
      created_at: old_follower.created_at,
      updated_at: old_follower.updated_at
    )
    if !new_follower.save
      reporter.add_error(
        new_follower.errors.details,
        context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, follower: old_follower.id }
      )
    end
  end
end

def rake_20240910_migrate_cosponsors(proposal, initiative, reporter)
  initiative.cosponsors_initiatives.each do |old_cosponsor|
    new_cosponsor = Cosponsorship.new(
      idea: proposal,
      user_id: old_cosponsor.user_id,
      status: old_cosponsor.status,
      created_at: old_cosponsor.created_at,
      updated_at: old_cosponsor.updated_at
    )
    if !new_cosponsor.save
      reporter.add_error(
        new_cosponsor.errors.details,
        context: { tenant: AppConfiguration.instance.host, proposal: proposal.slug, cosponsor: old_cosponsor.id }
      )
    end
  end
end

def rake_20240910_migrate_initiatives_static_page(reporter)
  page = rake_20240910_initiatives_page
  return if !page

  page.code = 'custom'

  substitue_text = proc do |locale, text|
    config = AppConfiguration.instance
    text.gsub!('$|initiativesVotingThreshold|', config.settings('initiatives', 'reacting_threshold').to_s)
    text.gsub!('$|initiativesDaysLimit|', config.settings('initiatives', 'days_limit').to_s)
    text.gsub!('$|initiativesEligibilityCriteria|', ((config.settings('initiatives', 'eligibility_criteria') || {})[locale] || ''))
    text.gsub!('$|initiativesThresholdReachedMessage|', ((config.settings('initiatives', 'threshold_reached_message') || {})[locale] || ''))
  end
  page.top_info_section_multiloc&.each(&substitue_text)
  page.bottom_info_section_multiloc&.each(&substitue_text)

  if !page.save
    reporter.add_error(
      page.errors.details,
      context: { tenant: AppConfiguration.instance.host, static_page: page.id }
    )
  end
end

def rake_20240910_initiatives_page
  StaticPage.find_by(code: 'proposals') || StaticPage.find_by(slug: 'initiatives')
end

# rubocop:disable Style/StringLiterals

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
    org_name = Locale.new(key).resolve_multiloc(AppConfiguration.instance.settings('core', 'organization_name')) || ''
    [key, value.gsub('{styledOrgName}', org_name)]
  end
end

def rake_20240910_migrate_project_description_multiloc
  config = AppConfiguration.instance
  expire_days_limit = config.settings('initiatives', 'days_limit')
  reacting_threshold = config.settings('initiatives', 'reacting_threshold')
  page_slug = rake_20240910_initiatives_page&.slug
  multiloc_content = {
    "ar-MA" => "ألديك مُقترح ما ترغب في إرساله إلى {orgName}، وتشعر بالفضول لمعرفة مدى دعم الناس له أيضًا؟ انشر مُقترحك هنا، وأثبت دعم الناس له من خلال جمع {constraints}، وستقوم {orgName} بمعاودة التواصل معك. {link}",
    "ar-SA" => "ألديك مُقترح ما ترغب في إرساله إلى {orgName}، وتشعر بالفضول لمعرفة مدى دعم الناس له أيضًا؟ انشر مُقترحك هنا، وأثبت دعم الناس له من خلال جمع {constraints}، وستقوم {orgName} بمعاودة التواصل معك. {link}",
    "ca-ES" => "Teniu una proposta que voleu enviar a {orgName} i teniu curiositat per veure si altres persones també la donen suport? Publiqueu-lo aquí, demostreu que és compatible amb la recopilació de {constraints} i {orgName} us respondrà. {link}",
    "cy-GB" => "Mae gennych gynnig yr ydych am ei gyflwyno i {orgName}, ac rydych yn chwilfrydig i weld a yw pobl eraill yn ei gefnogi hefyd? Postiwch ef yma, profwch ei fod yn cael ei gefnogi gan gasglu {constraints}, a bydd {orgName} yn dod yn ôl atoch. {link}",
    "da-DK" => "Du har et forslag, som du vil sende til {orgName}, og du er nysgerrig efter at se, om andre borgere også støtter det? Send det her, få {constraints}, og {orgName} vil vende tilbage til dig. {link}",
    "de-DE" => "Du hast einen Vorschlag, den du bei {orgName} einreichen möchtest, und bist neugierig, ob andere Leute ihn auch unterstützen? Poste ihn hier, sammle {constraints} und {orgName} wird sich bei dir melden. {link}",
    "el-GR" => "Έχετε μια πρόταση που θέλετε να υποβάλετε στο {orgName} και είστε περίεργοι να δείτε αν την υποστηρίζουν και άλλοι; Δημοσιεύστε την εδώ, αποδείξτε ότι υποστηρίζεται συλλέγοντας {constraints}, και ο {orgName} θα επικοινωνήσει μαζί σας. {link}",
    "en-CA" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "en-GB" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "en-IE" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "en" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "es-CL" => "¿Tienes una propuesta que quieres presentar en {orgName}, y tienes curiosidad por ver si otras personas también la apoyan? Súbela aquí, demuestra que está apoyada recogiendo {constraints}, y {orgName} se pondrá en contacto contigo. {link}",
    "es-ES" => "¿Tienes una propuesta que quieres presentar en {orgName}, y tienes curiosidad por ver si otras personas también la apoyan? Súbela aquí, demuestra que está apoyada recogiendo {constraints}, y {orgName} se pondrá en contacto contigo. {link}",
    "fi-FI" => "Sinulla on ehdotus, jonka haluat lähettää {orgName}, ja olet utelias näkemään, tukevatko sitä myös muut ihmiset? Lähetä se tänne, todista, että sitä tuetaan keräämällä {constraints}, niin {orgName} ottaa sinuun yhteyttä. {link}",
    "fr-BE" => "Vous avez une proposition à nous soumettre. Partagez la ici, obtenez {constraints} et {orgName} vous répondra. {link}",
    "fr-FR" => "Vous avez une proposition à nous soumettre. Partagez la ici, obtenez {constraints} et {orgName} vous répondra. {link}",
    "hr-HR" => "Imate prijedlog koji biste željeli predati {orgName} i zanima vas bi li ga i drugi podržali? Objavite ga ovdje i pokažite da ima podršku sakupljajući {constraints}, a {orgName} će vas kontaktirati. {link}",
    "hu-HU" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "it-IT" => "Hai una proposta che vuoi sottoporre a {orgName}, e sei curioso di vedere se anche altre persone la sostengono? Postala qui, dimostra che è supportata dalla raccolta di {constraints}, e {orgName} ti risponderà. {link}",
    "kl-GL" => "Nassiunniakkannik siunnersuutissaqarputit uunga {orgName}, takorusuppallu innuttaasut allat aamma tapersersorneraat? Ugguuna nassiutiguk, taava {constraints}-imik pissaasit, unalu {orgName} ilinnut uterumaarpoq. {link} ",
    "lb-LU" => "Dir hutt e Virschlag deen Dir op {orgName} areeche wëllt an Dir sidd virwëtzeg ob och aner Leit se ënnerstëtzen? Verëffentlecht en hei, beweist datt en ënnerstëtzt gëtt andeems Dir {Constraints} sammelt, an {orgName} kennt op Iech zréck. {link} ",
    "lv-LV" => "Jums ir priekšlikums, ko vēlaties iesniegt {orgName}, un jūs interesē, vai to atbalsta arī citi cilvēki? Ievietojiet to šeit, pierādiet, ka tas tiek atbalstīts, apkopojot {constraints}, un {orgName} ar jums sazināsies. {link}",
    "mi" => "You have a proposal that you want to submit to {orgName}, and you're curious to see whether other people support it as well? Post it here, prove that it's supported by collecting {constraints}, and {orgName} will get back to you. {link}",
    "nb-NO" => "Du har et forslag som du ønsker å sende inn til {orgName}. Er du nysgjerrig på om andre også støtter det? Publiser det her, få {constraints}, og {orgName} vil komme tilbake til deg {link}",
    "nl-BE" => "Je hebt een voorstel dat je wil voorleggen aan {orgName} en je bent benieuwd of andere mensen het ook steunen? Plaats het hier, verzamel {constraints} om te tonen dat het draagkracht heeft en {orgName} komt bij je terug. {link}",
    "nl-NL" => "Je hebt een voorstel dat je wil voorleggen aan {orgName} en je bent benieuwd of andere mensen het ook steunen? Plaats het hier, verzamel {constraints} om te tonen dat het draagkracht heeft en {orgName} komt bij je terug. {link}",
    "pl-PL" => "Masz propozycję, którą chcesz złożyć i jesteś ciekaw, czy inni ludzie też ją popierają? Umieść ją tutaj, udowodnij, że ma ona poparcie poprzez zebranie {constraints}, a {orgName} zwróci się do Ciebie. {link}",
    "pt-BR" => "Você tem uma proposta que deseja enviar para {orgName}, e está curioso para ver se outras pessoas também a apoiam? Coloque-a aqui, prove que ela é suportada coletando {constraints}, e {orgName} irá retornar para você. {link}",
    "ro-RO" => "Ai o propunere pe care dorești sa o trimiți {orgName} și ești curios să vezi dacă și alte persoane îți împărtășesc opinia? O poți posta aici pentru a strânge minimul de {constraints} și {orgName} te va contacta.",
    "sr-Latn" => "Imate predlog koji biste želeli da uputite ka {orgName}, i zanima vas da li bi ga i drugi podržali? Postavite ga ovde i pokažite da ima podršku sakupljajući {constraints}, i {orgName} će vas kontaktirati. {link}",
    "sr-SP" => "Имате предлог који желите да поднесете {orgName}, и радознали сте да видите да ли га подржавају и други људи? Објавите га овде, докажите да је подржано прикупљањем {constraints}, а {orgName} ће вам се вратити. {link}",
    "sv-SE" => "Har du ett förslag som du vill skicka till {orgName} och är nyfiken på om andra personer också stödjer det? Publicera det här, bevisa att det stöds genom att samla in {constraints}, så återkommer {orgName} till dig. {link}",
    "tr-TR" => "{orgName} için sunmak istediğiniz bir öneriniz var ve başkalarının da bunu destekleyip desteklemediğini mi merak ediyorsunuz? Burada yayınlayın ve {constraints} toplayarak önerinizin desteklendiğini kanıtlayın, {orgName} sizinle iletişim kuracaktır. {link}"
  }
  multiloc_constraints = {
    "ar-MA" => "{voteThreshold} من الأصوات خلال {daysLimit} من الأيام",
    "ar-SA" => "{voteThreshold} من الأصوات خلال {daysLimit} من الأيام",
    "ca-ES" => "{voteThreshold} vots en {daysLimit} dies",
    "cy-GB" => "{voteThreshold} pleidleisiau o fewn {daysLimit} diwrnod",
    "da-DK" => "{voteThreshold} stemmer inden for {daysLimit} dage",
    "de-DE" => "{voteThreshold} Stimmen innerhalb von {daysLimit} Tagen",
    "el-GR" => "{voteThreshold} ψήφοι εντός {daysLimit} ημερών",
    "en-CA" => "{voteThreshold} votes within {daysLimit} days",
    "en-GB" => "{voteThreshold} votes within {daysLimit} days",
    "en-IE" => "{voteThreshold} votes within {daysLimit} days",
    "en" => "{voteThreshold} votes within {daysLimit} days",
    "es-CL" => "{voteThreshold} votos en {daysLimit} días",
    "es-ES" => "{voteThreshold} votos en {daysLimit} días",
    "fi-FI" => "{voteThreshold} ääntä {daysLimit} päivän sisällä",
    "fr-BE" => "{voteThreshold} votes dans un délai de {daysLimit} jours",
    "fr-FR" => "{voteThreshold} votes dans un délai de {daysLimit} jours",
    "hr-HR" => "{voteThreshold} glasova u roku od {daysLimit} dana",
    "hu-HU" => "{voteThreshold} votes within {daysLimit} days",
    "it-IT" => "{voteThreshold} voti entro {daysLimit} giorni",
    "kl-GL" => "{voteThreshold} ullut uku iluanni taasinerit {daysLimit} ",
    "lb-LU" => "{voteThreshold} Stëmmen innerhalb vun {daysLimit} Deeg",
    "lv-LV" => "{voteThreshold} balsis {daysLimit} dienu laikā",
    "mi" => "{voteThreshold} votes within {daysLimit} days",
    "nb-NO" => "{voteThreshold} stemmer innen {daysLimit} dager",
    "nl-BE" => "{voteThreshold} stemmen in {daysLimit} dagen",
    "nl-NL" => "{voteThreshold} stemmen in {daysLimit} dagen",
    "nn-NO" => "{voteThreshold} stemmer innen {daysLimit} dager",
    "pl-PL" => "{voteThreshold} głosów w ciągu {daysLimit} dni",
    "pt-BR" => "{voteThreshold} votos dentro de {daysLimit} dias",
    "ro-RO" => "{voteThreshold} voturi în {daysLimit} zile",
    "sr-Latn" => "{voteThreshold} glasova u roku od {daysLimit} dana",
    "sr-SP" => "{voteThreshold} гласова у року од {daysLimit} дана",
    "sv-SE" => "{voteThreshold} röster inom {daysLimit} dagar",
    "tr-TR" => "{daysLimit} gün içinde {voteThreshold} oy"
  }
  multiloc_link = {
    "ar-MA" => "اعرف المزيد حول المُقترحات.",
    "ar-SA" => "اعرف المزيد حول المُقترحات.",
    "ca-ES" => "Obteniu més informació sobre com funcionen les propostes.",
    "cy-GB" => "Dysgwch fwy am sut mae cynigion yn gweithio.",
    "da-DK" => "Læs mere om hvordan forslag fungerer.",
    "de-DE" => "Mehr zu den Zulassungskriterien von Vorschlägen.",
    "el-GR" => "Μάθετε περισσότερα σχετικά με τον τρόπο λειτουργίας των προτάσεων.",
    "en-CA" => "Learn more about how proposals work.",
    "en-GB" => "Learn more about how proposals work.",
    "en-IE" => "Learn more about how proposals work.",
    "en" => "Learn more about how proposals work.",
    "es-CL" => "Aprende más sobre cómo funcionan las propuestas.",
    "es-ES" => "Conoce más sobre cómo funcionan las propuestas.",
    "fi-FI" => "Lue lisää ehdotusten toiminnasta.",
    "fr-BE" => "Apprenez-en plus sur le fonctionnement des propositions.",
    "fr-FR" => "Apprenez-en plus sur le fonctionnement des propositions.",
    "hr-HR" => "Saznajte kako funkcioniraju prijedlozi.",
    "hu-HU" => "Learn more about how proposals work.",
    "it-IT" => "Per saperne di più sulle proposte.",
    "kl-GL" => "Innuttaasunut siunnersuuteqartarnerup ingerlariaasia paasisaqarfigiuk",
    "lb-LU" => "Gitt méi doriwwer gewuer wéi Virschléi funktionéieren.",
    "lv-LV" => "Uzzināt vairāk par to, kā darbojas priekšlikumi.",
    "mi" => "Learn more about how proposals work.",
    "nb-NO" => "Lær mere om hvordan borger forslag fungerer.",
    "nl-BE" => "Lees meer over hoe voorstellen werken.",
    "nl-NL" => "Lees meer over hoe voorstellen werken.",
    "pl-PL" => "Dowiedz się więcej o tym, jak działają propozycje.",
    "pt-BR" => "Saiba mais sobre como as propostas funcionam.",
    "ro-RO" => "Aflați mai multe despre modul în care funcționează propunerile.",
    "sr-Latn" => "Saznajte kako funkcioniše predlaganje.",
    "sr-SP" => "Сазнајте више о томе како функционишу предлози.",
    "sv-SE" => "Läs mer om hur förslag fungerar.",
    "tr-TR" => "Önerilerin işleyiş şekli hakkında daha fazla bilgi edinin."
  }
  case config.name
  when 'RegionSjælland'
    multiloc_content['da-DK'] = "Har du et forslag til, hvordan Region Sjælland kan blive sundere, grønnere og mere lige for alle? Så har du mulighed for at stille dit borgerforslag og sætte det til offentlig afstemning her på platformen. Hvis dit forslag opfylder kriterierne og opnår {constraints}, vil det blive behandlet af dine regionspolitikere. {link}"
  when 'KøbenhavnsKommune'
    multiloc_content['da-DK'] = "Har du et forslag til, hvordan København kan blive en endnu bedre by at bo og færdes i? Så har du mulighed for at stille dit københavnerforslag og sætte det til offentlig afstemning her på platformen. Hvis dit forslag opfylder kriterierne og opnår {constraints}, vil det blive behandlet af vores kommunalpolitikere. {link}"
  when 'HolbækKommune'
    multiloc_content['da-DK'] = "Har du en idé til hvordan kommunen kan blive endnu bedre, eller et forslag som du synes politikerne skal drøfte? Så opret et borgerforslag her. Hvis det opnår {constraints}, kommer det videre til Kommunalbestyrelsen. Husk at du skal være MitID-valideret for at kunne stille forslag. {link}"
  end
  multiloc_content.to_h do |key, value|
    org_name = Locale.new(key).resolve_multiloc(config.settings('core', 'organization_name')) || ''
    new_value = value.gsub('{orgName}', org_name)
    new_value = if page_slug
      link = "/#{key}/pages/#{page_slug}"
      text = if config.name == 'KøbenhavnsKommune' && key == 'da-DK'
        'Her kan du læse mere om retningslinjer og kriterier for Københavnerforslagsordningen.'
      elsif config.name == 'RegionSjælland' && key == 'da-DK'
        'Læs mere om, hvordan ordningen med borgerforslag fungerer.'
      else
        multiloc_link[key]
      end
      new_value.gsub('{link}', "<a href=\"#{link}\">#{text}</a>")
    else
      new_value.gsub('{link}', '')
    end
    constraints_text = "<strong>#{multiloc_constraints[key]}</strong>"
    new_value = new_value.gsub(
      '{constraints}',
      constraints_text.gsub('{daysLimit}', expire_days_limit.to_s).gsub('{voteThreshold}', reacting_threshold.to_s)
    )
    [key, new_value]
  end
end

def rake_20240910_migrate_homepage_title_multiloc
  multiloc = {
    "ar-MA" => "ما هو مُقترحك؟",
    "ar-SA" => "ما هو مُقترحك؟",
    "ca-ES" => "Quina és la vostra proposta?",
    "cy-GB" => "Beth yw eich cynnig?",
    "da-DK" => "Hvad er dit forslag?",
    "de-DE" => "Wie lautet Ihr Vorschlag?",
    "el-GR" => "Ποια είναι η πρότασή σας;",
    "en-CA" => "What is your proposal?",
    "en-GB" => "What is your proposal?",
    "en-IE" => "What is your proposal?",
    "en" => "What is your proposal?",
    "es-CL" => "¿Cuál es tu propuesta?",
    "es-ES" => "¿Cuál es tu propuesta?",
    "fi-FI" => "Mikä on ehdotuksesi?",
    "fr-BE" => "Quelle est votre proposition ?",
    "fr-FR" => "Quelle est votre proposition ?",
    "hr-HR" => "Koji je vaš prijedlog?",
    "hu-HU" => "What is your proposal?",
    "it-IT" => "Qual è la sua proposta?",
    "kl-GL" => "Innuttaasutut siunnersuutit sunaava?",
    "lb-LU" => "Wat ass Äre Virschlag?",
    "lv-LV" => "Kāds ir jūsu priekšlikums?",
    "mi" => "E tono ana koe mō te aha?",
    "nb-NO" => "Hva er forslaget ditt?",
    "nl-BE" => "Wat is jouw voorstel?",
    "nl-NL" => "Geen plaats voor jouw plannen? Start je eigen voorstel!",
    "pl-PL" => "O czym jest twoja propozycja?",
    "pt-BR" => "Qual é a sua proposta?",
    "ro-RO" => "Care este propunerea ta?",
    "sr-Latn" => "Koji je vaš predlog?",
    "sr-SP" => "Шта је ваш предлог?",
    "sv-SE" => "Vad är ditt förslag?",
    "tr-TR" => "Öneriniz nedir?"
  }

  case AppConfiguration.instance.name
  when 'KøbenhavnsKommune'
    multiloc['da-DK'] = 'Stil og støt københavnerforslag'
  when 'RegionSjælland'
    multiloc['da-DK'] = 'Stil og støt borgerforslag'
  end

  multiloc
end

def rake_20240910_migrate_homepage_description_multiloc
  multiloc = {
    "ar-MA" => "انشر مُقترحك على هذه المنصة، احشد الدعم وضعه على جدول الأعمال. أو اطلع على مُقترحات الآخرين.",
    "ar-SA" => "انشر مُقترحك على هذه المنصة، احشد الدعم وضعه على جدول الأعمال. أو اطلع على مُقترحات الآخرين.",
    "ca-ES" => "Publiqueu la vostra proposta en aquesta plataforma, reculliu suport i col·loqueu-lo a l'agenda. O reviseu els suggeriments dels altres.",
    "cy-GB" => "Postiwch eich cynnig ar y platfform hwn, casglwch gefnogaeth a rhowch ef ar yr agenda. Neu adolygwch awgrymiadau eraill.",
    "da-DK" => "Du kan aflevere dit forslag på denne platform, indsamle støtte fra andre borgere og sætte det på kommunens dagsorden. Du kan også tage et kig på forslag fra andre borgere.",
    "de-DE" => "Reiche deinen Vorschlag auf dieser Plattform ein, sammle dafür Unterstützung und setze ihn auf unsere Tagesordnung. Oder lass dich von anderen Vorschlägen inspirieren.",
    "el-GR" => "Δημοσιεύστε την πρότασή σας σε αυτή την πλατφόρμα, συγκεντρώστε υποστήριξη και βάλτε την στην ημερήσια διάταξη. Ή εξετάστε τις προτάσεις των άλλων.",
    "en-CA" => "Post your proposal on this platform, gather support and place it on the agenda. Or review the suggestions of others.",
    "en-GB" => "Post your proposal on this platform, gather support and place it on the agenda. Or review the suggestions of others.",
    "en-IE" => "Post your proposal on this platform, gather support and place it on the agenda. Or review the suggestions of others.",
    "en" => "Post your proposal on this platform, gather support and place it on the agenda. Or review the suggestions of others.",
    "es-CL" => "Publica tu propuesta en la plataforma, reúne apoyo y colócala en la agenda. O revisa las sugerencias de otros.",
    "es-ES" => "Publica tu propuesta en la plataforma, reúne apoyo y colócala en la agenda. O revisa las sugerencias de otros.",
    "fi-FI" => "Lähetä ehdotuksesi tälle alustalle, kerää tukea ja laita se asialistalle. Tai tutustu muiden ehdotuksiin.",
    "fr-BE" => "Postez votre proposition sur cette plateforme, recueillez des soutiens et mettez-la à l'ordre du jour. Ou explorez simplement les propositions de vos concitoyens.",
    "fr-FR" => "Postez votre proposition sur cette plateforme, recueillez des soutiens et mettez-la à l'ordre du jour. Ou explorez simplement les propositions de vos concitoyens.",
    "hr-HR" => "Objavite svoj prijedlog na ovoj platformi, prikupite podršku, stavite ga na dnevni red ili pregledajte prijedloge drugih.",
    "hu-HU" => "Post your proposal on this platform, gather support and place it on the agenda. Or review the suggestions of others.",
    "it-IT" => "Pubblica la tua proposta su questa piattaforma, raccogli il sostegno e mettila all'ordine del giorno. Oppure esamina i suggerimenti degli altri.",
    "kl-GL" => "Isaaffimmut uunga siunnersuutit allassinnaavat, innuttaasunit allanit tapersersorneqarsinnaavutit aamma kommunimit oqallisigisassanngortissinnaavat. Aamma innuttaasut allat siunnersuutaat atuarsinnaavatit.",
    "lb-LU" => "Verëffentlecht Äre Virschlag fir administrativ Vereinfachung op dëser Plattform, sammelt Ënnerstëtzung a setzt se op d’Agenda. Oder kuckt d’Virschléi vun anere Persounen.",
    "lv-LV" => "Publicējiet savu priekšlikumu šajā platformā, iegūstiet atbalstu un iekļaujiet to darba kārtībā. Vai arī izskatiet citu personu ieteikumus.",
    "mi" => "Whakairia tō tono ki tēnei pūhara, me whai tautoko, ka whakauru ai ki te rārangi take. Tirohia ngā whakaaro a ētahi atu.",
    "nb-NO" => "Publiser forslaget ditt på platformen. Hent støtte fra andre innbyggere og sett forslaget på agendaen. Du kan også se andres forslag.",
    "nl-BE" => "Plaats jouw voorstel op dit platform, verzamel steun en breng het op de agenda. Of discussieer mee over de voorstellen van anderen.",
    "nl-NL" => "Samen maken we het hier mooier. We leveren allemaal een bijdrage aan. Heb jij een mooi plan? Laat het ons weten!",
    "pl-PL" => "Umieść swoją propozycję na tej platformie, zbierz poparcie i umieść ją w porządku dziennym lub zapoznaj się z sugestiami innych.",
    "pt-BR" => "Publique sua proposta nesta plataforma, obtenha suporte e coloque-a na agenda. Ou revise as sugestões de outras pessoas.",
    "ro-RO" => "Postează propunerea ta pe această platformă și pune-o astfel pe ordinea de zi a primăriei!",
    "sr-Latn" => "Objavite svoj predlog na ovoj platformi, prikupite podršku, stavite ga na dnevni red ili pregledajte predloge drugih.",
    "sr-SP" => "Објавите свој предлог на овој платформи, прикупите подршку и ставите га на дневни ред. Или прегледајте предлоге других.",
    "sv-SE" => "Publicera ditt förslag på den här plattformen, samla stöd och sätt upp det på dagordningen. Eller granska andras förslag.",
    "tr-TR" => "Önerinizi bu platformda yayınlayın, destek toplayın ve gündeme yerleştirin. Veya başkalarının önerilerini inceleyin."
  }

  case AppConfiguration.instance.name
  when 'KøbenhavnsKommune'
    multiloc['da-DK'] = 'Har du et forslag til ændringer i Københavns Kommune, som du ønsker at sætte på den politiske dagsorden, kan du stille et københavnerforslag her på platformen. Du kan også se og støtte andres forslag.'
  when 'RegionSjælland'
    multiloc['da-DK'] = 'Har du et forslag til ændringer i Region Sjælland, som du ønsker at sætte på den politiske dagsorden, kan du stille et borgerforslag her på platformen. Du kan også se og støtte andres forslag.'
  end

  multiloc
end

def rake_20240910_migrate_homepage_explore_multiloc
  {
    "ar-MA" => "استكشف جميع المُقترحات",
    "ar-SA" => "استكشف جميع المُقترحات",
    "ca-ES" => "Exploreu totes les propostes",
    "cy-GB" => "Archwiliwch yr holl gynigion",
    "da-DK" => "Se alle forslag",
    "de-DE" => "Alle Vorschläge erkunden",
    "el-GR" => "Εξερευνήστε όλες τις προτάσεις",
    "en-CA" => "Explore all proposals",
    "en-GB" => "Explore all proposals",
    "en-IE" => "Explore all proposals",
    "en" => "Explore all proposals",
    "es-CL" => "Explora todas las iniciativas",
    "es-ES" => "Explora todas las propuestas",
    "fi-FI" => "Tutustu kaikkiin ehdotuksiin",
    "fr-BE" => "Explorez toutes les propositions",
    "fr-FR" => "Explorez toutes les propositions",
    "hr-HR" => "Istražite sve prijedloge",
    "hu-HU" => "Explore all proposals",
    "it-IT" => "Esplora tutte le proposte",
    "kl-GL" => "Innuttaasut siunnersuutaat tamaasa takukkit",
    "lb-LU" => "Entdeckt all dVirschléi",
    "lv-LV" => "Izpētīt visus priekšlikumus",
    "mi" => "Tūhuratia ngā tono katoa",
    "nb-NO" => "Utforsk alle forslag",
    "nl-BE" => "Ontdek alle voorstellen",
    "nl-NL" => "Ontdek alle voorstellen",
    "pl-PL" => "Zapoznaj się z wszystkimi propozycjami",
    "pt-BR" => "Explore todas as propostas",
    "ro-RO" => "Explorează toate propunerile",
    "sr-Latn" => "Istražite sve predloge",
    "sr-SP" => "Истражите све предлоге",
    "sv-SE" => "Utforska alla förslag",
    "tr-TR" => "Tüm önerileri inceleyin"
  }
end

# rubocop:enable Style/StringLiterals
