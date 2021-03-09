# frozen_string_literal: true

class PermissionsService

  class << self
    def add_scope(scope_spec)
      scopes << scope_spec
    end

    def scopes
      @scopes ||= []
    end

    def scope_types
      scopes.map(&:scope_types).flatten
    end

    def actions(scope)
      permission_scope_type = scope.nil? ? nil : scope.class.to_s
      scope_description = scopes.find { |desc| desc.scope_types.include?(permission_scope_type) }
      scope_description.actions(scope)
    end
  end

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
    update_permissions_for_scope(nil)
  end

  def update_permissions_for_context(participation_context)
    return unless participation_context.participation_context?
    
    update_permissions_for_scope(participation_context)
  end

  def update_all_permissions
    update_global_permissions
    
    self.class.scope_types.without(nil).each do |type|
      model_class = type.constantize
      model_class.all.each { |scope| update_permissions_for_scope(scope) }
    end
    
    Permissions.select(&:invalid?).each(&:destroy!)
  end

  def update_permissions_for_scope(scope)
    actions = self.class.actions(scope)
    remove_extras_actions(scope, actions)
    add_missing_actions(scope, actions)
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
  def denied?(user, action, resource = nil)
    scope = resource&.permission_scope
    permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)
    permission ? permission.denied?(user) : 'not_permitted' # denied by default (= when there is no permission)
  end

  private

  def remove_extras_actions(scope, actions = nil)
    actions ||= self.class.actions(scope)
    Permissions.where(scope: scope)
               .where.not(action: actions)
               .destroy_all
  end

  def add_missing_actions(scope, actions = nil)
    missing_actions = missing_actions(scope, actions)
    permissions_hashes = missing_actions.map { |action| { action: action } }
    Permission.create(permissions_hashes) { permission.scope = scope }
  end

  def missing_actions(scope, actions = nil)
    actions ||= self.class.actions(scope)
    actions - Permission.where(permission_scope: scope).pluck(:action)
  end
end

PermissionsService.add_scope(CitizenLab::Permissions::Scopes::Global)
PermissionsService.add_scope(CitizenLab::Permissions::Scopes::ParticipationContext)
