# frozen_string_literal: true

# Demo data for the opinion groups prototype (Innoviris WP4).
#
# The task creates a Common Ground project with 24 statements and 160
# participants in three designed opinion camps. Age and gender correlate with
# the camp. Real data often gives one large group (almost all reactions are
# likes), so use this project to show the opinion map and the demographics.
#
# The task is idempotent: it deletes the demo project and the demo users of a
# previous run first. The random generator has a fixed seed, so each run gives
# the same data.
#
# Usage: bin/rails "opinion_groups:seed_demo[localhost]"
namespace :opinion_groups do
  desc 'Create a demo Common Ground project with three opinion camps'
  task :seed_demo, [:host] => :environment do |_t, args|
    host = args[:host] || 'localhost'
    Tenant.find_by!(host: host).switch do
      OpinionGroupsDemoSeed.new.run
    end
  end
end

class OpinionGroupsDemoSeed
  TITLE = 'Mobility plan 2030 - Common ground (demo)'
  EMAIL_PATTERN = 'opinion-groups-demo-%@example.com'

  # Each statement has an affinity per camp: 1 = the camp mostly agrees,
  # -1 = the camp mostly disagrees, 0 = the camp is split.
  STATEMENTS = [
    ['Make the city centre car-free on weekends', [1, -1, 0]],
    ['Build a ring of park-and-ride sites at the edge of the city', [1, 1, 1]],
    ['Lower the speed limit to 30 km/h on all residential streets', [1, -1, 1]],
    ['Add more parking spaces in the centre', [-1, 1, 0]],
    ['Extend the tram network to the northern districts', [1, 0, 1]],
    ['Free public transport for under 25s', [1, -1, 1]],
    ['Replace on-street parking with bicycle lanes on main roads', [1, -1, -1]],
    ['Keep parking free in residential areas', [-1, 1, 1]],
    ['More frequent night buses', [1, 0, 1]],
    ['Install speed cameras near schools', [1, 1, 1]],
    ['Congestion charge for driving into the centre', [1, -1, -1]],
    ['Widen the motorway access roads', [-1, 1, -1]],
    ['Plant trees along every main street', [1, 0, 1]],
    ['Ban delivery vans from the centre during the day', [1, -1, 0]],
    ['Cheaper resident parking permits', [-1, 1, 1]],
    ['A shared e-scooter scheme', [0, -1, 1]],
    ['Better lighting on cycling paths', [1, 1, 1]],
    ['Reduce bus fares for seniors', [0, 1, 1]],
    ['Convert the market square into a pedestrian zone', [1, -1, 0]],
    ['More electric charging points in residential streets', [0, 1, 1]],
    ['Close the school streets to cars at drop-off time', [1, 0, 1]],
    ['Build a new multi-storey car park near the station', [-1, 1, 0]],
    ['Priority lanes for buses on the ring road', [1, -1, 1]],
    ['Subsidised cargo bikes for families', [1, -1, 1]]
  ].freeze

  # Camp 0 "car-light city": younger, more female.
  # Camp 1 "keep the car": older, more male.
  # Camp 2 "pragmatic mix": all ages.
  CAMPS = [
    { size: 70, birthyears: 1985..2007, genders: %w[female female male unspecified] },
    { size: 50, birthyears: 1950..1985, genders: %w[male male female unspecified] },
    { size: 40, birthyears: 1950..2007, genders: %w[male female unspecified] }
  ].freeze

  # The probability that a participant reacts to a statement.
  SEEN_SHARE = 0.75

  def initialize
    @rng = Random.new(2026)
  end

  def run
    clean_up
    phase = create_phase
    ideas = create_statements(phase)
    create_participants(ideas)

    reactions = Reaction.where(reactable: ideas).count
    puts "project=#{phase.project_id} phase=#{phase.id} statements=#{ideas.size} reactions=#{reactions}"
    puts "url=#{AppConfiguration.instance.base_frontend_uri}/en/admin/projects/#{phase.project_id}/phases/#{phase.id}/opinion-groups"
  end

  private

  def clean_up
    Project.where("title_multiloc->>'en' = ?", TITLE).destroy_all
    User.where('email LIKE ?', EMAIL_PATTERN).destroy_all
  end

  def create_phase
    project = Project.create!(
      title_multiloc: { 'en' => TITLE },
      slug: 'mobility-common-ground-demo',
      visible_to: 'public',
      admin_publication_attributes: { publication_status: 'published' }
    )
    phase = Phase.create!(
      project: project,
      title_multiloc: { 'en' => 'Find common ground' },
      participation_method: 'common_ground',
      start_at: 60.days.ago.to_date,
      end_at: 30.days.from_now.to_date
    )
    phase.pmethod.assign_defaults_for_phase
    phase.save!
    Permissions::PermissionsUpdateService.new.update_permissions_for_scope(phase)
    phase
  end

  def create_statements(phase)
    author = User.admin.first
    status = IdeaStatus.find_by(code: 'proposed', participation_method: 'ideation') ||
             IdeaStatus.find_by(code: 'proposed')
    STATEMENTS.map do |text, _affinity|
      Idea.create!(
        title_multiloc: { 'en' => text },
        project: phase.project,
        creation_phase: phase,
        phases: [phase],
        author: author,
        idea_status: status,
        publication_status: 'published',
        published_at: 50.days.ago
      )
    end
  end

  def create_participants(ideas)
    gender_field = CustomField.registration.find_by(code: 'gender')
    birthyear_field = CustomField.registration.find_by(code: 'birthyear')

    CAMPS.each_with_index do |camp, camp_index|
      camp[:size].times do |i|
        user = User.create!(
          email: "opinion-groups-demo-#{camp_index}-#{i}@example.com",
          first_name: 'Demo',
          last_name: "Participant #{camp_index}-#{i}",
          password: SecureRandom.base64(24),
          locale: 'en',
          registration_completed_at: 40.days.ago
        )
        add_answer(user, gender_field, 'gender', camp[:genders].sample(random: @rng))
        add_answer(user, birthyear_field, 'birthyear', @rng.rand(camp[:birthyears]))
        react(user, ideas, camp_index)
      end
    end
  end

  def add_answer(user, field, key, value)
    user.custom_field_answers.create!(key: key, value: value, custom_field: field)
  end

  def react(user, ideas, camp_index)
    ideas.each_with_index do |idea, j|
      next unless @rng.rand < SEEN_SHARE

      Reaction.create!(reactable: idea, user: user, mode: reaction_mode(STATEMENTS[j][1][camp_index]))
    end
  end

  def reaction_mode(affinity)
    r = @rng.rand
    case affinity
    when 1 then pick(r, %w[up neutral down])
    when -1 then pick(r, %w[down neutral up])
    else split(r)
    end
  end

  # 80% the camp position, 12% neutral, 8% the opposite.
  def pick(r, (main, middle, opposite))
    return main if r < 0.8
    return middle if r < 0.92

    opposite
  end

  # A split camp: 40% agree, 40% disagree, 20% neutral.
  def split(r)
    return 'up' if r < 0.4
    return 'down' if r < 0.8

    'neutral'
  end
end
