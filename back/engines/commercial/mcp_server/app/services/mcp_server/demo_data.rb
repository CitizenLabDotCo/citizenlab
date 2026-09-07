# frozen_string_literal: true

# Shared machinery for the demo-data tools. The fixed email domain marks demo
# users, so it doubles as the query key for ceilings and future cleanup.
module McpServer::DemoData
  EMAIL_DOMAIN = 'demo-users.govocal.com'
  MAX_INPUTS_PER_PROJECT = 1_000
  MAX_USERS_PER_TENANT = 5_000

  module_function

  def demo_users
    User.where('email LIKE ?', "%@#{EMAIL_DOMAIN}")
  end

  def demo_input_count(project)
    project.ideas.where(author: demo_users).count
  end

  # Built without a password, so demo users cannot sign in.
  def build_author(registered_at)
    first_name = Faker::Name.first_name
    last_name = Faker::Name.last_name
    # parameterize: Faker names can contain apostrophes/accents, invalid in emails.
    User.new(
      email: "#{"#{first_name}.#{last_name}".parameterize(separator: '.')}.#{SecureRandom.hex(4)}@#{EMAIL_DOMAIN}",
      first_name: first_name,
      last_name: last_name,
      locale: AppConfiguration.instance.settings('core', 'locales').sample,
      custom_field_values: RandomCustomFieldValuesService.new.generate(CustomField.registration.enabled),
      confirmation_required: false,
      email_confirmed_at: registered_at,
      registration_completed_at: registered_at,
      created_at: registered_at
    )
  end

  # Timestamps shaped like a real participation curve over [from, to] (clamped
  # to the past): a launch spike decaying over time, with bumps around events.
  def sample_times(count, from:, to:, event_times: [])
    now = Time.zone.now
    to = [to, now].min
    return Array.new(count, now) if from >= to

    days = ((to - from) / 1.day).ceil
    event_days = event_times.filter_map { |time| ((time - from) / 1.day).floor if time.between?(from, to) }
    weights = Array.new(days) do |day|
      weight = 1.0 + (9.0 * Math.exp(-3.0 * day / days))
      weight += 5.0 if event_days.any? { |event_day| (day - event_day).abs <= 1 }
      weight
    end

    total = weights.sum
    Array.new(count) do
      target = rand * total
      day = weights.find_index { |weight| (target -= weight) <= 0 } || (days - 1)
      [from + day.days + rand(86_400).seconds, to].min
    end
  end
end
