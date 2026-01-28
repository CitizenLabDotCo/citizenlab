# frozen_string_literal: true

class UserReduceService
  # Service to automatically reduce the number of
  # users.
  #
  # See: https://docs.google.com/document/d/1REUc69m2fn1vCtBOMosWjAXDPSSRB9Hgh-Lf1OmXnX0/edit?usp=sharing

  # Ideally, "followers" should not be blacklisted, but there was no time to tackle the uniqueness constraint issue. This is a temporary solution.
  MERGE_TABLES_BLACKLIST = %w[
    activities email_campaigns_campaign_email_commands
    email_campaigns_campaigns email_campaigns_consents
    email_campaigns_unsubscription_tokens email_campaigns_deliveries
    followers identities invites memberships notifications
    onboarding_campaign_dismissals spam_reports users
    verification_verifications
  ].freeze

  def reduce!(skip_users: nil, timeout: nil)
    t_start = Time.now
    skip_users ||= User.admin
    scope = User.where.not id: skip_users

    project_sets = compute_project_sets scope
    loop do
      can_pick_empty_set = true
      picked_project_sets = Set.new
      picked_users = []
      while (project_set = pick_next_project_set! project_sets, exclude: picked_project_sets, can_pick_empty_set: can_pick_empty_set)
        picked_project_sets ||= project_set
        picked_project_sets |= project_set
        picked_users += [project_sets[project_set].pop]
        can_pick_empty_set = false if project_set.empty?
      end

      return if picked_users.size < 2

      merge! picked_users, project_sets: project_sets

      return if timeout && (Time.now - t_start) > timeout
    end
  end

  def merge!(users, project_sets: nil)
    # Merges all other users into the first user. Deletes the other users.

    merged_user = pick_and_pop_user_for_merge! users, project_sets: project_sets
    users_to_merge = users

    occurences = {}
    uuid_columns.select do |table_name, column_names|
      column_names.each do |column_name|
        ActiveRecord::Base.connection.execute(
          <<-SQL.squish
            SELECT #{column_name}
            FROM #{table_name}
            WHERE #{column_name} IN (#{users_to_merge.map { |u| "'#{u.id}'" }.join(',')})
          SQL
        ).present?
      end
      occurences[table_name] = column_names if column_names.present?
    end

    ActiveRecord::Base.transaction do
      occurences.each do |table_name, columns|
        columns.each do |column|
          query = <<-SQL.squish
            UPDATE #{table_name}
            SET #{column} = '#{merged_user.id}'
            WHERE #{column} IN (#{users_to_merge.map { |u| "'#{u.id}'" }.join(',')})
          SQL
          ActiveRecord::Base.connection.execute query
        end
      end
      users_to_merge.each(&:destroy!)
    end
  end

  private

  def compute_project_sets(scope)
    # Project sets are hashes where the keys are
    # sets of project IDs and the values are
    # users who participated in exacly just those
    # projects.

    picked_project_sets = {}
    participants_service = ParticipantsService.new

    context_participants = Project.all.to_h do |project|
      participants = participants_service.project_participants project
      [project.id, participants.map(&:id)]
    end

    scope.each do |user|
      set = Set.new
      context_participants.each do |context, participant_ids|
        set.add context if participant_ids.include? user.id
      end
      picked_project_sets[set] ||= []
      picked_project_sets[set] += [user]
    end
    picked_project_sets.each_value(&:shuffle!)
    picked_project_sets
  end

  def pick_next_project_set!(project_sets, exclude: Set.new, can_pick_empty_set: true)
    # Pick users who didn't participate anywhere first.

    project_sets.select do |project_set, participants|
      participants.present? && !project_set.intersect?(exclude) && (!project_set.empty? || can_pick_empty_set)
    end.to_a.min do |l1, l2|
      set1, prtcps1 = l1
      set2, prtcps2 = l2
      [set1.size, -prtcps1.size] <=> [set2.size, -prtcps2.size]
    end&.first
  end

  def pick_and_pop_user_for_merge!(users, project_sets: nil)
    # TODO: pick the user that participated in the most projects
    users.pop
  end

  def uuid_columns
    # Memoized computation of all tables (keys) and columns (values)
    # of UUID type that should be considered (excluding the tables
    # blacklist) for merging user ID occurences.
    @uuid_columns ||= ActiveRecord::Base.connection.execute(
      <<-SQL.squish
        SELECT table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema = '#{Tenant.current.schema_name}'
      SQL
    ).pluck('table_name').uniq.reject do |table_name|
      MERGE_TABLES_BLACKLIST.include? table_name
    end.to_h do |table_name|
      column_names = ActiveRecord::Base.connection.execute(
        <<-SQL.squish
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = '#{table_name}'
          AND data_type = 'uuid'
          AND table_schema = '#{Tenant.current.schema_name}'
        SQL
      ).pluck('column_name').uniq
      [table_name, column_names]
    end
  end
end
