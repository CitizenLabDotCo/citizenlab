class InitiativeStatusService

  MANUAL_TRANSITIONS = {
    'proposed' => {
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

  def auto_transitions 
    {
      'proposed' => {
        'threshold_reached' => method(:threshold_reached?),
        'expired' => method(:expired?)
      }
    }
  end

  def transition_allowed? initiative, status1, status2, with_feedback: false
    transition_possibility = MANUAL_TRANSITIONS.dig status1.code, status2.code
    transition_possibility && (!transition_possibility[:feedback_required] || with_feedback)
  end

  # def transition! initiative, status1, status2, official_feedback_params: nil
  #   if manual_transitions[status1.code]&.include? status2.code
  #     ActiveRecord::Base.transaction do
  #       initiative.update! idea_status: status2
  #       initiative.official_feedbacks.create! official_feedback_params
  #     end
  #     log_status_change initiative
  #   elsif auto_transitions.dig(status1.code, status2.code)&.call(initiative)
  #     initiative.update! idea_status: status2
  #     log_status_change initiative
  #   else
  #     raise 'Transition not permitted!'  # TODO make transaction error
  #   end
  # end

  def allowed_transitions initiative
    return [] if !initiative.initiative_status_id
    codes = MANUAL_TRANSITIONS[initiative.initiative_status.code]
    InitiativeStatus.where(code: codes.keys).pluck(:code, :id).map do |code id|
      [id, codes[code]]
    end.to_h
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

end