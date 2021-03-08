# frozen_string_literal: true

class PermissionsService

  ACTIONS = {
    'information' => %w(),
    'ideation' => %w(posting_idea voting_idea commenting_idea),
    'survey' => %w(taking_survey),
    'poll' => %w(taking_poll),
    'budgeting' => %w(commenting_idea budgeting),
    'volunteering' => %w(),
    nil => %w(posting_initiative voting_initiative commenting_initiative)
  }

  def initialize
    @verification_service = Verification::VerificationService.new
  end

  def update_global_permissions
    actions = ACTIONS[nil]
    Permission.where(permission_scope: nil).where.not(action: actions).each(&:destroy!)
    actions&.select do |action|
      !Permission.where(permission_scope: nil).find_by action: action
    end.map do |action|
      Permission.create! action: action
    end
  end

  def update_permissions_for_context(participation_context)
    if participation_context.participation_context?
      actions = ACTIONS[participation_context.participation_method]
      participation_context.permissions.where.not(action: actions).each(&:destroy!)
      actions&.select do |action|
        !participation_context.permissions.find_by action: action
      end.map do |action|
        participation_context.permissions.create! action: action
      end
    end
  end

  def update_all_permissions
    PermissionsService.new.update_global_permissions
    Project.all.each do |project|
      PermissionsService.new.update_permissions_for_context project
      project.phases.each do |phase|
        PermissionsService.new.update_permissions_for_context phase
      end
    end
    Permission.all.each do |permission|
      permission.destroy! if !permission.valid?
    end
  end

  def posting_initiative_disabled_reason(user)
    denied?(user, 'posting_initiative')
  end

  def commenting_initiative_disabled_reason(user)
    denied?(user, 'commenting_initiative')
  end

  def voting_initiative_disabled_reason(user)
    denied?(user, 'voting_initiative')
  end

  def cancelling_votes_disabled_reason_for_initiative(user)
    denied?(user, 'voting_initiative')
  end

  def voting_disabled_reason_for_initiative_comment(user)
    commenting_initiative_disabled_reason(user)
  end

  # +resource+ is +nil+ for actions that are run within the global scope and 
  # are not tied to any resource.
  #
  # @param [#permission_scope, NilClass] resource
  # @return [String, nil] Reason if denied, nil otherwise.
  def denied?(user, action, resource=nil)
    scope = resource || resource.permission_scope
    permission = Permission.find_by(permission_scope: scope, action: action)
    permission.denied?(user)
  end
end
