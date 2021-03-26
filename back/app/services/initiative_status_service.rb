class InitiativeStatusService

  MANUAL_TRANSITIONS = {
    'proposed' => {
      'answered' => {
        feedback_required: true
      },
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
    'expired' => {
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
    'proposed' => {
      'threshold_reached' => {
        scope_contition: lambda{ |initiative_scope|
          initiative_scope.where(
            'initiatives.upvotes_count >= ?', 
            AppConfiguration.instance.settings('initiatives', 'voting_threshold')
            )
        }
      },
      'expired' => {
        scope_contition: lambda{ |initiative_scope|
          initiative_scope.where(
            'initiatives.published_at < ?', 
            (Time.now - AppConfiguration.instance.settings('initiatives', 'days_limit').days)
            )
        }
      }
    }
  }


  def transition_allowed? initiative, status1, status2, with_feedback: false
    transition_possibility = MANUAL_TRANSITIONS.dig status1.code, status2.code
    transition_possibility && (!transition_possibility[:feedback_required] || with_feedback)
  end

  def automated_transitions!
    AUTO_TRANSITIONS.each do |status_code_from, transitions|
      transitions.each do |status_code_to, transition_instructions|
        # Get the initiatives that need to make the transtion.
        initiatives = Initiative.published.with_status_code(status_code_from)
        initiatives = transition_instructions[:scope_contition].call initiatives
        # Create the status changes.
        status_id_to = InitiativeStatus.find_by(code: status_code_to)&.id
        if status_id_to
          changes = InitiativeStatusChange.create!(initiatives.ids.map{ |id|
            {
              initiative_id: id,
              initiative_status_id: status_id_to
            }
          })
          # Log the status change activities.
          InitiativeStatusChange.where(id: changes.map(&:id)).includes(:initiative, :initiative_status).each do |change|
            log_status_change change
          end
        end
      end
    end
  end

  def allowed_transitions initiative
    return [] if !initiative.initiative_status_id
    codes = MANUAL_TRANSITIONS[initiative.initiative_status.code]
    InitiativeStatus.where(code: codes.keys).pluck(:code, :id).map do |code, id|
      [id, codes[code]]
    end.to_h
  end

  def transition_type initiative_status
    if manual_status_ids.include? initiative_status.id
      'manual'
    else
      'automatic'
    end
  end

  def manual_status_ids
    InitiativeStatus.where(code: MANUAL_TRANSITIONS.values.map(&:keys).flatten.uniq).ids
  end

  def log_status_change change, user: nil
    LogActivityJob.perform_later(change.initiative, 'changed_status', user, change.created_at.to_i)
    if change.initiative_status.code == 'threshold_reached'
      LogActivityJob.perform_later(change.initiative, 'reached_threshold', user, change.created_at.to_i)
    end
  end

end