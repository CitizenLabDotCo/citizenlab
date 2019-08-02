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
            Tenant.current.settings.dig('initiatives', 'voting_threshold')
            )
        }
      },
      'expired' => {
        scope_contition: lambda{ |initiative_scope|
          initiative_scope.where(
            'initiatives.published_at < ?', 
            (Time.now - Tenant.current.settings.dig('initiatives', 'days_limit').days)
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
        initiatives = Initiative.published
          .joins('LEFT OUTER JOIN initiative_initiative_statuses ON initiatives.id = initiative_initiative_statuses.initiative_id')
          .joins('LEFT OUTER JOIN initiative_statuses ON initiative_statuses.id = initiative_initiative_statuses.initiative_status_id')
          .where('initiative_statuses.code = ?', status_code_from)
        initiatives = transition_instructions[:scope_contition].call initiatives
        # Create the status changes.
        status_id_to = InitiativeStatus.find_by(code: status_code_to).id
        changes = InitiativeStatusChange.create!(initiatives.ids.map{ |id|
          {
            initiative_id: id,
            initiative_status_id: status_id_to
          }
        })
        # Log the status change activities.
        InitiativeStatusChange.where(id: changes.map(&:id)).includes(:initiative).each do |change|
          log_status_change change
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

  def log_status_change change, user: nil
    LogActivityJob.perform_later(change.initiative, 'changed_status', user, change.created_at.to_i)
  end

end