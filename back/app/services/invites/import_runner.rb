# frozen_string_literal: true

# Runs the work of an invites job and records its outcome on the InvitesImport
# row. The front end polls that row, so every path has to end in a completed
# import — otherwise it waits on a job that will never report back.
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
    # Anything else (a DB error, a validation raised outside the invitee checks)
    # would otherwise leave the import pending forever, since neither invites job
    # retries — the admin would wait out the front-end timeout instead of being
    # shown the error. Record the failure, then re-raise so it is not swallowed.
    import&.update!(
      result: { errors: [{ error: 'unexpected_invite_error' }] },
      completed_at: Time.current
    )
    raise
  end
end
