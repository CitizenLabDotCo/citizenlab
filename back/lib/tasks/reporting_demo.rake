# frozen_string_literal: true

# Seeds one project with enough real participation data to judge a generated
# report against: several phases, residents with demographics, ideas that were
# reacted to and commented on, a survey with answers, and visitor traffic.
#
# Idempotent by project slug: running it again replaces the project it made.
#
#   docker compose run --rm web bin/rails reporting:seed_demo_project
#   docker compose run --rm web bin/rails reporting:seed_demo_project[other-host]
namespace :reporting do
  desc 'Seed a project with rich participation data, for LLM report generation'
  task :seed_demo_project, %i[host] => [:environment] do |_task, args|
    Apartment::Tenant.switch(args[:host] || 'localhost') do
      ReportingDemoSeed.new.run
    end
  end
end

class ReportingDemoSeed
  SLUG = 'riverside-park-renewal'
  RESIDENT_COUNT = 90
  IDEA_COUNT = 34
  SURVEY_RESPONSE_COUNT = 68
  SESSION_COUNT = 620

  IDEA_TITLES = [
    'Plant a shade canopy along the main path', 'Open the riverbank for swimming',
    'A skate bowl by the north entrance', 'Quiet reading garden near the library',
    'Outdoor gym by the football pitch', 'Weekly farmers market on the meadow',
    'Better lighting on the river walk', 'A dog run fenced off from the playground',
    'Rewild the eastern edge', 'Drinking fountains every 300 metres',
    'A bandstand for summer concerts', 'Repair the bridge handrail',
    'Toddler play area with shade', 'Bat and bird boxes in the old oaks',
    'Cycle path separated from walkers', 'Public toilets near the car park',
    'A wildflower meadow instead of mown grass', 'Benches facing the water',
    'Community allotments on the south lawn', 'Wheelchair access to the jetty',
    'Basketball half court', 'A café in the old keeper\'s hut',
    'Bins that stop the gulls', 'Signposted running loop with distances',
    'Ice rink in December', 'Shelter at the bus stop by the gate',
    'Nature trail for schools', 'Fix the flooding by the east gate',
    'Table tennis tables', 'Boules court under the limes',
    'Stage for the summer festival', 'A pond for model boats',
    'Bike parking at every entrance', 'Storytelling circle for children'
  ].freeze

  COMMENTS = [
    'This would make a real difference for families here.',
    'Agreed, but who maintains it once it is built?',
    'We asked for this five years ago. Good to see it back.',
    'Please make sure it stays accessible for wheelchairs.',
    'Lovely idea, though the budget worries me.',
    'The north end needs this more than the south.',
    'Could this be combined with the lighting proposal?',
    'I would use this every week.',
    'Not convinced. The money is better spent on the paths.',
    'My children would love it.'
  ].freeze

  def run
    ActiveRecord::Base.transaction do
      destroy_existing
      @project = create_project
      @ideation, @survey, @voting = create_phases
      # Model creation alone leaves out what the app does around it: the project's
      # page-builder layout (without which the project page renders and then blanks),
      # its default topics, and the phases' participation permissions.
      run_side_effects
      @residents = create_residents
      create_survey_form
      create_ideas
      create_survey_responses
      create_traffic
    end

    report
  end

  private

  def destroy_existing
    existing = Project.find_by(slug: SLUG)
    return if existing.nil?

    puts "Removing the previous #{SLUG} project"
    ImpactTracking::Pageview.where(project_id: existing.id).destroy_all
    existing.destroy!
  end

  def create_project
    puts 'Creating the project'
    Project.create!(
      title_multiloc: { 'en' => 'Riverside Park renewal' },
      description_preview_multiloc: {
        'en' => 'How should we spend the £1.2m set aside to renew Riverside Park?'
      },
      slug: SLUG,
      visible_to: 'public',
      listed: true,
      admin_publication_attributes: { publication_status: 'published' }
    )
  end

  def create_phases
    puts 'Creating the phases'
    ideation = Phase.create!(
      project: @project,
      title_multiloc: { 'en' => 'Share your ideas' },
      participation_method: 'ideation',
      start_at: 5.months.ago.to_date,
      end_at: 3.months.ago.to_date,
      submission_enabled: true,
      commenting_enabled: true,
      reacting_enabled: true,
      reacting_like_method: 'unlimited',
      reacting_dislike_enabled: true,
      reacting_dislike_method: 'unlimited'
    )
    survey = Phase.create!(
      project: @project,
      title_multiloc: { 'en' => 'Tell us what matters most' },
      participation_method: 'native_survey',
      native_survey_title_multiloc: { 'en' => 'Riverside Park survey' },
      native_survey_button_multiloc: { 'en' => 'Take the survey' },
      start_at: (3.months.ago + 1.day).to_date,
      end_at: 1.month.ago.to_date,
      submission_enabled: true
    )
    voting = Phase.create!(
      project: @project,
      title_multiloc: { 'en' => 'Vote on the shortlist' },
      participation_method: 'voting',
      voting_method: 'single_voting',
      voting_max_total: 5,
      start_at: (1.month.ago + 1.day).to_date,
      end_at: nil
    )
    [ideation, survey, voting]
  end

  def run_side_effects
    puts 'Running the project and phase side effects'
    admin = User.admin.first
    ContentBuilder::LayoutProvisioningService.new.provision_for(@project)
    SideFxProjectService.new.after_create(@project, admin)
    [@ideation, @survey, @voting].each { |phase| SideFxPhaseService.new.after_create(phase, admin) }
  end

  def create_residents
    puts "Creating #{RESIDENT_COUNT} residents"
    anonymizer = AnonymizeUserService.new
    locales = AppConfiguration.instance.settings('core', 'locales')

    Array.new(RESIDENT_COUNT) do |index|
      attributes = anonymizer.anonymized_attributes(locales)
      registered_at = rand(6.months.ago..1.week.ago)
      User.create!(
        attributes.merge(
          'email' => "riverside-resident-#{index}-#{SecureRandom.hex(3)}@example.org",
          'password' => 'democracy2.0',
          'registration_completed_at' => registered_at,
          'created_at' => registered_at
        )
      )
    end
  end

  def create_survey_form
    puts 'Creating the survey form'
    form = CustomForm.create!(participation_context: @survey)

    @q_priority = create_select_field(
      form, 'priority', 'Which change would you most like to see first?',
      ['More green space', 'Better paths and lighting', 'Places to play', 'Somewhere to eat and meet'],
      ordering: 0
    )
    @q_visit = create_select_field(
      form, 'visit_frequency', 'How often do you visit the park?',
      ['Most days', 'A few times a month', 'A few times a year', 'This would be my first visit'],
      ordering: 1
    )
    @q_safety = CustomField.create!(
      resource: form, key: 'safety', input_type: 'linear_scale', ordering: 2,
      title_multiloc: { 'en' => 'How safe do you feel in the park after dark?' },
      maximum: 5,
      linear_scale_label_1_multiloc: { 'en' => 'Not at all safe' },
      linear_scale_label_5_multiloc: { 'en' => 'Very safe' }
    )
    @q_feeling = CustomField.create!(
      resource: form, key: 'feeling', input_type: 'sentiment_linear_scale', ordering: 3,
      title_multiloc: { 'en' => 'How do you feel about the park as it is today?' },
      maximum: 5
    )
    @q_anything = CustomField.create!(
      resource: form, key: 'anything_else', input_type: 'multiline_text', ordering: 4,
      title_multiloc: { 'en' => 'Anything else the council should know?' }
    )
  end

  def create_select_field(form, key, title, option_titles, ordering:)
    field = CustomField.create!(
      resource: form, key: key, input_type: 'select', ordering: ordering,
      title_multiloc: { 'en' => title }
    )
    option_titles.each_with_index do |option_title, index|
      CustomFieldOption.create!(
        custom_field: field, key: option_title.parameterize.underscore,
        title_multiloc: { 'en' => option_title }, ordering: index
      )
    end
    field
  end

  def create_ideas
    puts "Creating #{IDEA_COUNT} ideas with reactions and comments"
    status = IdeaStatus.find_by(code: 'proposed', participation_method: 'ideation') ||
             IdeaStatus.for_public_posts.first

    IDEA_TITLES.first(IDEA_COUNT).each_with_index do |title, index|
      published_at = rand(@ideation.start_at.to_time..@ideation.end_at.to_time)
      idea = Idea.create!(
        title_multiloc: { 'en' => title },
        body_multiloc: { 'en' => "<p>#{Faker::Lorem.paragraph(sentence_count: 3)}</p>" },
        idea_status: status,
        author: @residents.sample,
        project: @project,
        phases: [@ideation],
        creation_phase: nil,
        publication_status: 'published',
        published_at: published_at,
        created_at: published_at
      )

      # A long tail: a few ideas draw most of the support, most draw a little.
      popularity = index < 6 ? rand(0.45..0.8) : rand(0.02..0.25)
      @residents.sample((RESIDENT_COUNT * popularity).round).each do |resident|
        Reaction.create!(
          reactable: idea, user: resident,
          mode: rand < 0.85 ? 'up' : 'down',
          created_at: rand(published_at..@ideation.end_at.to_time)
        )
      end

      rand(0..5).times do
        Comment.create!(
          idea: idea, author: @residents.sample,
          body_multiloc: { 'en' => COMMENTS.sample },
          created_at: rand(published_at..@ideation.end_at.to_time)
        )
      end
    end
  end

  def create_survey_responses
    puts "Creating #{SURVEY_RESPONSE_COUNT} survey responses"
    priority_keys = @q_priority.options.pluck(:key)
    visit_keys = @q_visit.options.pluck(:key)

    @residents.sample(SURVEY_RESPONSE_COUNT).each do |resident|
      submitted_at = rand(@survey.start_at.to_time..@survey.end_at.to_time)
      Idea.create!(
        project: @project,
        phases: [@survey],
        creation_phase: @survey,
        author: resident,
        publication_status: 'published',
        published_at: submitted_at,
        created_at: submitted_at,
        custom_field_values: {
          @q_priority.key => weighted_sample(priority_keys, [0.42, 0.28, 0.19, 0.11]),
          @q_visit.key => weighted_sample(visit_keys, [0.34, 0.38, 0.22, 0.06]),
          @q_safety.key => weighted_sample([1, 2, 3, 4, 5], [0.12, 0.21, 0.3, 0.24, 0.13]),
          @q_feeling.key => weighted_sample([1, 2, 3, 4, 5], [0.06, 0.14, 0.27, 0.35, 0.18]),
          @q_anything.key => COMMENTS.sample
        }
      )
    end
  end

  def weighted_sample(values, weights)
    target = rand
    cumulative = 0.0
    values.each_with_index do |value, index|
      cumulative += weights[index]
      return value if target <= cumulative
    end
    values.last
  end

  def create_traffic
    puts "Creating #{SESSION_COUNT} visitor sessions"
    devices = %w[desktop mobile tablet]
    device_weights = [0.44, 0.49, 0.07]
    referrers = [nil, 'https://www.google.com/', 'https://www.facebook.com/', 'https://news.example.org/']
    referrer_weights = [0.46, 0.3, 0.16, 0.08]
    window = 5.months.ago.to_time..Time.zone.now

    SESSION_COUNT.times do
      started_at = rand(window)
      signed_in = rand < 0.35
      session = ImpactTracking::Session.create!(
        monthly_user_hash: SecureRandom.hex(16),
        user_id: signed_in ? @residents.sample.id : nil,
        highest_role: signed_in ? 'user' : nil,
        device_type: weighted_sample(devices, device_weights),
        referrer: weighted_sample(referrers, referrer_weights),
        created_at: started_at
      )

      rand(1..4).times do
        ImpactTracking::Pageview.create!(
          session: session,
          path: "/en/projects/#{SLUG}",
          project_id: @project.id,
          created_at: started_at + rand(0..600).seconds
        )
      end
    end
  end

  def report
    puts <<~SUMMARY

      Seeded #{@project.title_multiloc['en']} (/#{SLUG})
        project id  #{@project.id}
        residents   #{@residents.size}
        ideas       #{@project.ideas.where(creation_phase_id: nil).count}
        responses   #{@project.ideas.where(creation_phase_id: @survey.id).count}
        reactions   #{Reaction.where(reactable: @project.ideas).count}
        comments    #{Comment.where(idea: @project.ideas).count}
        sessions    #{SESSION_COUNT}
    SUMMARY
  end
end
