class InitiativeStatusService

  def manual_transitions 
    {
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
  end

  def auto_transitions 
    {
      'published' => {
        'threshold_reached' => method(:threshold_reached?),
        'expired' => method(:expired?)
      }
    }
  end

  def transition initiative, status1, status2, official_feedback_params: nil
    if manual_transitions[status1.code]&.include? status2.code
      ActiveRecord::Base.transaction do
        initiative.update! idea_status: status2
        initiative.official_feedbacks.create! official_feedback_params
      end
      log_status_change initiative
    elsif auto_transitions.dig(status1.code, status2.code)&.call(initiative)
      initiative.update! idea_status: status2
      log_status_change initiative
    else
      raise 'Transition not permitted!'  # TODO make transaction error
    end
  end

  def allowed_transitions initiative
    return [] if !initiative.initiative_status_id
    codes = manual_transitions[initiative.initiative_status.code].keys
    InitiativeStatus.where(code: codes).ids
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