# Verify the idea write-path correctly sets phase_method_id when the client
# either (a) sends phase_method_id explicitly, or (b) doesn't send it
# (auto-inferred from the phase's legacy participation_method column).

Apartment::Tenant.switch('localhost') do
  project = Project.find_by!(slug: 'poc-parallel-methods')
  phase = project.phases.first
  ideation_pm = phase.phase_methods.find_by!(method_type: 'ideation')
  status = IdeaStatus.find_by!(code: 'proposed')

  puts "phase_id=#{phase.id}"
  puts "ideation_phase_method_id=#{ideation_pm.id}"

  # --- Path A: client sends phase_method_id explicitly ---
  idea_a = Idea.new(
    project: project,
    phase_method: ideation_pm,
    title_multiloc: { 'en' => 'POC E2E write-path A (explicit)' },
    body_multiloc: { 'en' => '<p>Submitted with explicit phase_method_id.</p>' },
    publication_status: 'published',
    idea_status: status,
    submitted_at: Time.current,
    published_at: Time.current
  )
  idea_a.phases << phase
  idea_a.save!
  puts "A: idea=#{idea_a.id} phase_method_id=#{idea_a.phase_method_id} (matches ideation_pm? #{idea_a.phase_method_id == ideation_pm.id})"

  # --- Path B: simulate auto-inference (no phase_method given) ---
  # We replicate the controller logic: when phase_method_id is blank, look up
  # the PhaseMethod whose method_type matches the phase's legacy participation_method.
  idea_b = Idea.new(
    project: project,
    title_multiloc: { 'en' => 'POC E2E write-path B (inferred)' },
    body_multiloc: { 'en' => '<p>No phase_method given — controller infers it.</p>' },
    publication_status: 'published',
    idea_status: status,
    submitted_at: Time.current,
    published_at: Time.current
  )
  idea_b.phases << phase
  # Mimic ideas_controller.rb auto-inference block:
  if idea_b.phase_method_id.blank?
    inferred = phase.phase_methods.find_by(method_type: phase.participation_method)
    idea_b.phase_method_id = inferred.id if inferred
  end
  idea_b.save!
  puts "B: idea=#{idea_b.id} phase_method_id=#{idea_b.phase_method_id} (matches ideation_pm? #{idea_b.phase_method_id == ideation_pm.id})"

  puts "\n--- Reporting Query Pattern 2 (now includes new ideas) ---"
  phase.phase_methods.order(:method_type).each do |pm|
    ideas = Idea.where(phase_method_id: pm.id)
    puts "  #{pm.method_type.ljust(15)} ideas=#{ideas.count}"
  end
end
