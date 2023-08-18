# frozen_string_literal: true

class InitiativeService
  def log_proposed(initiative, user, datetime)
    LogActivityJob.perform_later(initiative, 'proposed', user, datetime.to_i)
  end
end
