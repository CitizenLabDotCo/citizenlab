# POC: create a project with one phase that has TWO parallel PhaseMethods
# (ideation + native_survey), demonstrating Approach 2 from the Notion doc.
#
# Idempotent: drops + recreates the project if it already exists.

Apartment::Tenant.switch('localhost') do
  slug = 'poc-parallel-methods'
  existing = Project.find_by(slug: slug)
  existing&.destroy!

  project = Project.create!(
    slug: slug,
    title_multiloc: { 'en' => 'POC: Parallel Methods Demo' },
    description_multiloc: { 'en' => '<p>Demonstrates ideation + survey running in parallel inside a single Community Input phase.</p>' },
    description_preview_multiloc: { 'en' => 'Ideation + survey running in parallel' },
    visible_to: 'public',
    listed: true
  )
  puts "project_id=#{project.id} slug=#{project.slug}"

  AdminPublication.find_or_create_by!(publication: project) do |ap|
    ap.publication_status = 'published'
  end

  community_input = Phase.create!(
    project: project,
    title_multiloc: { 'en' => 'Community Input (Parallel Methods)' },
    description_multiloc: { 'en' => '<p>Ideation runs the full window. Native survey runs in parallel but ends earlier.</p>' },
    start_at: Date.parse('2026-05-20'),
    end_at: Date.parse('2026-06-27'),
    participation_method: 'ideation', # legacy column — kept consistent with primary method
    submission_enabled: true,
    commenting_enabled: true,
    reacting_enabled: true,
    input_term: 'idea',
    ideas_order: 'random'
  )
  puts "phase_id=#{community_input.id} legacy_participation_method=#{community_input.participation_method}"

  # The create_phase_methods migration already inserted one row for ideation
  # (because the new Phase was created with participation_method='ideation'? No —
  # the migration only ran once historically. New phases don't auto-insert
  # phase_methods. So insert both explicitly.)
  community_input.phase_methods.destroy_all

  ideation_pm = community_input.phase_methods.create!(
    method_type: 'ideation',
    start_at: Date.parse('2026-05-20'),
    end_at: Date.parse('2026-06-20')
  )
  survey_pm = community_input.phase_methods.create!(
    method_type: 'native_survey',
    start_at: Date.parse('2026-05-20'),
    end_at: Date.parse('2026-06-27')
  )
  puts "ideation_phase_method_id=#{ideation_pm.id} (#{ideation_pm.start_at.to_date} → #{ideation_pm.end_at.to_date})"
  puts "survey_phase_method_id=#{survey_pm.id} (#{survey_pm.start_at.to_date} → #{survey_pm.end_at.to_date})"

  # Create a few ideas bound to the ideation PhaseMethod (the new path)
  status = IdeaStatus.find_or_create_by!(code: 'proposed') do |s|
    s.title_multiloc = { 'en' => 'Proposed' }
    s.description_multiloc = { 'en' => 'Proposed' }
    s.color = '#888888'
    s.participation_method = 'ideation'
  end

  3.times do |i|
    idea = Idea.new(
      project: project,
      phase_method: ideation_pm,                 # ← the NEW association
      title_multiloc: { 'en' => "POC idea ##{i + 1}" },
      body_multiloc: { 'en' => "<p>Body of POC idea ##{i + 1}, submitted via the ideation parallel method.</p>" },
      publication_status: 'published',
      idea_status: status,
      submitted_at: Time.current,
      published_at: Time.current
    )
    # For ideation, ideas join via ideas_phases (no creation_phase).
    idea.phases << community_input
    idea.save!
  end
  puts "ideas_created=#{Idea.where(phase_method_id: ideation_pm.id).count} ideas_bound_to_ideation_pm"

  # Open up permissions so signed-in users can submit ideas + take the survey
  Permissions::PermissionsUpdateService.new.update_permissions_for_scope(community_input)
  community_input.permissions.each do |p|
    p.update!(permitted_by: 'users')
  end
  puts "permissions_set: #{community_input.permissions.pluck(:action, :permitted_by).inspect}"

  # Ensure a custom_form is in place for the native_survey method so the survey CTA lands on a real survey
  if defined?(CustomForm) && community_input.custom_form.nil?
    cf = CustomForm.create!(
      participation_context: community_input,
      fields_last_updated_at: Time.current,
      print_start_multiloc: { 'en' => 'Survey' },
      print_end_multiloc: { 'en' => 'Thanks' }
    )
    page = CustomField.create!(
      resource: cf,
      key: 'page1',
      input_type: 'page',
      title_multiloc: { 'en' => 'Survey' },
      page_layout: 'default'
    )
    CustomField.create!(
      resource: cf,
      key: 'satisfaction',
      input_type: 'text',
      title_multiloc: { 'en' => 'How satisfied are you with this neighborhood?' },
      description_multiloc: { 'en' => 'Brief explanation (free text).' },
      required: false,
      enabled: true
    )
    puts "custom_form_id=#{cf.id} (with #{cf.custom_fields.count} fields)"
  end

  puts "\n--- Reporting Query Pattern 2 (method-level breakdown) ---"
  PhaseMethod.where(phase_id: community_input.id).order(:method_type).each do |pm|
    ideas = Idea.where(phase_method_id: pm.id)
    puts "  #{pm.method_type.ljust(15)} #{pm.start_at.to_date} → #{pm.end_at.to_date}  ideas=#{ideas.count}  participants=#{ideas.distinct.count(:author_id)}"
  end

  puts "\nDONE  project_url=http://localhost:3000/en/projects/#{project.slug}"
end
