namespace :initiatives_to_proposals do
  desc 'Replace the Citizenlab default moderator with Go Vocal attributes.'
  task :migrate_proposals, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      rake_20240910_substitute_homepage_element(reporter)
      project = rake_20240910_create_proposals_project(reporter)
      next if !project

      rake_20240910_replace_navbaritem(reporter)
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
      rake_20240910_migrate_smart_group_rules(map_initiatives_to_proposals, reporter)
    end
    reporter.report!('migrate_initiatives_to_proposals.json', verbose: true)
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

def rake_20240910_create_proposals_project(reporter)
  config = AppConfiguration.instance
  project = Project.new(
    title_multiloc: { # Include all locales
      'en' => 'Proposals',
      'nl-BE' => 'Voorstellen',
      'fr-BE' => 'Propositions'
    }
    # Include more project attributes
  )
  # Set visibility and granular permissions according to the permissions for initiatives
  if !project.save
    reporter.add_error(
      project.errors.details,
      context: { tenant: tenant.host, project: project.id }
    )
    return false
  end
  phase = Phase.new(
    project: project,
    title_multiloc: { # Include all locales
      'en' => 'Proposals',
      'nl-BE' => 'Voorstellen',
      'fr-BE' => 'Propositions'
    },
    start_at: config.created_at,
    end_at: nil,
    participation_method: 'proposals',
    expire_days_limit: config.settings('initiatives', 'days_limit'),
    reacting_threshold: config.settings('initiatives', 'reacting_threshold'),
    prescreening_enabled: SettingsService.new.feature_activated?('initiative_review')
    # Include cosponsorship settings
    # Include more phase attributes
  )
  if !phase.save
    reporter.add_error(
      phase.errors.details,
      context: { tenant: tenant.host, phase: phase.id }
    )
    return false
  end
  project
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
