# frozen_string_literal: true

require 'timeout'

module GeneralHelper
  # https://gist.github.com/jnicklas/d8da686061f0a59ffdf7#gistcomment-2900179
  def wait_until(time, interval: 0.01, &)
    Timeout.timeout(time) do
      sleep(interval) until (value = yield)
      value
    end
  end

  # return example: [[:capture_exception, ["param"], nil]]
  def messages_received(object)
    proxy = RSpec::Mocks.space.proxy_for(object)
    proxy.instance_variable_get(:@messages_received)
  end

  def iso8601_datetime_regex
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})/
  end
  alias iso8601_regex iso8601_datetime_regex
  alias time_regex iso8601_datetime_regex

  # Replaces the timezone of a timestamp without shifting the time values.
  def override_timezone(timestamp, timezone)
    timezone.local_to_utc(timestamp).in_time_zone(timezone)
  end

  def uuid_regex
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/ # After https://stackoverflow.com/a/6640851/3585671
  end

  def enable_exclude_admins_and_moderators_from_statistics
    config = AppConfiguration.instance
    config.settings['core']['exclude_admins_and_moderators_from_statistics'] = true
    config.save!
  end

  # Creates one user for every kind of admin and moderator: an admin, a moderator of
  # `project`, a moderator of another project, a folder moderator and a space
  # moderator. When admins and moderators are excluded from statistics, ALL of them
  # are excluded, not only the moderators of the project in question. The given
  # custom field answers (as `{ key => value }`) and attributes are applied to every user.
  def create_admins_and_moderators(project: create(:project), answers: {}, **attributes)
    [
      [:admin],
      [:project_moderator, { projects: [project] }],
      [:project_moderator, { projects: [create(:project)] }],
      [:project_folder_moderator],
      [:space_moderator]
    ].map do |factory, role_attributes = {}|
      custom_field_answers = answers.map { |key, value| build(:custom_field_answer, key: key, value: value) }
      create(factory, **role_attributes, custom_field_answers: custom_field_answers, **attributes)
    end
  end

  # The highest roles (e.g. of sessions) of all kinds of admins and moderators.
  def admin_and_moderator_highest_roles
    %w[admin super_admin project_moderator project_folder_moderator space_moderator]
  end
end
