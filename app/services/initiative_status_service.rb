class InitiativeStatusService

  MANUAL_TRANSITIONS = {
    'published' => {
      'ineligible' => {
        feedback_required: true
      }
    },
    'threshold_reached' => {
      'answered' => {
        feedback_required: true
      },
      'ineligible' => {
        feedback_required: true
      }
    },
    'answered' => {
      'ineligible' => {
        feedback_required: true
      }
    },
    'ineligible' => {
      'answered' => {
        feedback_required: true
      }
    }
  }

  AUTO_TRANSITIONS = {
    'published' => {
      'threshold_reached' => method(:threshold_reached?),
      'expired' => method(:expired?)
    }
  }

  def transition initiative, status1, status2, official_feedback_params: nil
    if MANUAL_TRANSITIONS[status1.code]&.include? status2.code
      ActiveRecord::Base.transaction do
        initiative.update! idea_status: status2
        initiative.official_feedbacks.create! official_feedback_params
      end
      log_status_change initiative
    elsif AUTO_TRANSITIONS.dig(status1.code, status2.code)&.call(initiative)
      initiative.update! idea_status: status2
      log_status_change initiative
    else
      raise 'Transition not permitted!'  # TODO make transaction error
    end
  end

  def threshold_reached? initiative
    initiative.upvotes >= Tenant.current.settings.dig('initiatives', 'voting_threshold')
  end

  def expired? initiative
    expiration_time(initiative) < Time.now
  end

  def expiration_time initiative
    initiative.published_at + Tenant.current.settings.dig('initiatives', 'days_limit').days
  end


  private

  def log_status_change initiative
    LogActivityJob.perform_later(initiative, 'changed_status', user, initiative.updated_at.to_i, payload: {change: initiative.initiative_status_id_previous_change})
  end

end