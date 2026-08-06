# frozen_string_literal: true

# Runs the work of an invites job and records its outcome on the InvitesImport row.
# The front end polls that row, so every path has to end in a completed import.
class Invites::ImportRunner
  def initialize(import_id)
    @import_id = import_id
  end

  def run
    import = InvitesImport.find(@import_id)
    result = yield
    import.update!(result: result, completed_at: Time.current)
  rescue Invites::FailedError => e
    import.update!(result: { errors: e.to_h }, completed_at: Time.current)
  rescue StandardError
    # Neither invites job retries, so without this the import stays pending forever.
    # Re-raise so Que and Sentry still see it. A killed worker leaves nothing to
    # rescue; only the front-end timeout covers that.
    import&.update!(
      result: { errors: [{ error: error_key(import) }] },
      completed_at: Time.current
    )
    raise
  end

  private

  # A failed count sent nothing, so the admin can just retry. A failed creation may
  # have got part way, so they are told to look first.
  def error_key(import)
    if import.job_type.include?('count_new_seats')
      'unexpected_seats_count_error'
    else
      'unexpected_invite_error'
    end
  end
end
