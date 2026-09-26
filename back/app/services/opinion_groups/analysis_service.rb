# frozen_string_literal: true

module OpinionGroups
  # Maps the participants of a phase into opinion groups from their reactions.
  #
  # Pipeline:
  #   1. Build a participant x statement matrix (like = 1, dislike = -1,
  #      neutral = 0, no reaction = column mean).
  #   2. Optionally append one-hot demographic features (task 4.4).
  #   3. Reduce to two dimensions with PCA.
  #   4. Cluster the 2D projection with k-means; pick k by silhouette score.
  #   5. Derive per-group statistics: representative statements, common
  #      ground and divisive statements, demographic composition.
  #
  # Everything is recomputed from scratch on each call.
  class AnalysisService
    Options = Struct.new(
      :k, :include_demographics, :demographic_weight,
      :min_votes_per_participant, :min_votes_per_statement, :privacy_threshold,
      keyword_init: true
    )

    DEFAULT_OPTIONS = {
      k: nil,
      include_demographics: false,
      demographic_weight: 0.5,
      min_votes_per_participant: 3,
      min_votes_per_statement: 3,
      privacy_threshold: 5
    }.freeze

    VOTE_VALUES = { 'up' => 1.0, 'down' => -1.0, 'neutral' => 0.0 }.freeze
    DIRECTIONAL_MODES = %w[up down].freeze
    TOP_N = 5
    MIN_GROUP_VOTES = 2

    Result = Struct.new(
      :phase_id, :parameters, :stats, :groups, :statements, :axes,
      :consensus, :divisive, :points, :demographic_fields, :participation_balance,
      keyword_init: true
    )

    def initialize(phase, options = {})
      @phase = phase
      @options = Options.new(**DEFAULT_OPTIONS, **options.compact)
      @demographics = Demographics.new
    end

    def call
      load_reactions
      filter_sparse
      build_matrix
      reduce_dimensions
      cluster
      compute_group_statistics

      Result.new(
        phase_id: @phase.id,
        parameters: @options.to_h,
        stats: stats,
        groups: @groups,
        statements: serialized_statements,
        axes: axes,
        consensus: @consensus,
        divisive: @divisive,
        points: points,
        demographic_fields: @demographics.fields.map(&:to_h).map { |f| f.merge(categories: f[:categories].map(&:to_h)) },
        participation_balance: participation_balance
      )
    end

    private

    # --- Step 1: data loading -------------------------------------------------

    def load_reactions
      @ideas = @phase.ideas.published.order(:created_at).to_a
      @ideas_by_id = @ideas.index_by(&:id)

      rows = Reaction
        .where(reactable_type: 'Idea', reactable_id: @ideas_by_id.keys)
        .where.not(user_id: nil)
        .pluck(:user_id, :reactable_id, :mode)

      # Authors automatically like their own input in ideation. That is not an
      # opinion signal, so we leave it out.
      rows.reject! { |user_id, idea_id, _mode| @ideas_by_id[idea_id].author_id == user_id }

      @votes = Hash.new { |h, k| h[k] = {} }
      rows.each { |user_id, idea_id, mode| @votes[user_id][idea_id] = mode }

      @all_voter_ids = @votes.keys
      @votes_total = rows.size
    end

    # Drop participants and statements with too few votes, until stable.
    def filter_sparse
      user_ids = @votes.keys
      idea_ids = @ideas_by_id.keys

      5.times do
        idea_votes = Hash.new(0)
        user_ids.each { |u| @votes[u].each_key { |i| idea_votes[i] += 1 } }
        new_idea_ids = idea_ids.select { |i| idea_votes[i] >= @options.min_votes_per_statement }
        idea_set = new_idea_ids.to_set
        new_user_ids = user_ids.select { |u| @votes[u].count { |i, _| idea_set.include?(i) } >= @options.min_votes_per_participant }
        stable = new_idea_ids == idea_ids && new_user_ids == user_ids
        idea_ids = new_idea_ids
        user_ids = new_user_ids
        break if stable
      end

      # Sorted, so that the output is deterministic.
      @participant_ids = user_ids.sort
      @statement_ids = idea_ids
      @statement_index = @statement_ids.each_with_index.to_h
    end

    # --- Step 2: matrix -------------------------------------------------------

    def build_matrix
      n_statements = @statement_ids.size
      column_sums = Array.new(n_statements, 0.0)
      column_counts = Array.new(n_statements, 0)

      @participant_ids.each do |u|
        @votes[u].each do |idea_id, mode|
          j = @statement_index[idea_id] or next
          column_sums[j] += VOTE_VALUES[mode]
          column_counts[j] += 1
        end
      end
      column_means = column_sums.each_with_index.map { |s, j| column_counts[j].zero? ? 0.0 : s / column_counts[j] }

      @rows = @participant_ids.map do |u|
        row = Array.new(n_statements, 0.0)
        @votes[u].each do |idea_id, mode|
          j = @statement_index[idea_id] or next
          row[j] = VOTE_VALUES[mode] - column_means[j]
        end
        row
      end

      load_participant_demographics
      append_demographic_features if @options.include_demographics
    end

    def load_participant_demographics
      values_by_user = User.where(id: @participant_ids).pluck(:id, :custom_field_values).to_h
      @categories_by_user = @participant_ids.index_with { |u| @demographics.categorize(values_by_user[u]) }
    end

    # Task 4.4, approach 1: add demographics as features before the PCA. Each
    # category becomes a centered one-hot column. The block is scaled so that
    # its total variance equals `demographic_weight` times the variance of the
    # first opinion axis (the first principal component of the votes alone).
    # With weight 1, demographics matter as much as the strongest opinion
    # divide; with weight 0 they have no effect.
    def append_demographic_features
      @demographic_columns = @demographics.fields.flat_map do |field|
        field.categories.map { |category| [field.key, category.key] }
      end
      return if @demographic_columns.empty? || @rows.empty?

      raw = @participant_ids.map do |u|
        categories = @categories_by_user[u]
        @demographic_columns.map { |field_key, category_key| categories[field_key] == category_key ? 1.0 : 0.0 }
      end
      means = @demographic_columns.each_index.map { |j| raw.sum { |r| r[j] } / raw.size }
      centered = raw.map { |r| r.each_with_index.map { |v, j| v - means[j] } }

      vote_variance = @rows.sum { |r| r.sum { |v| v * v } }
      first_axis_variance = vote_variance * Pca.new(@rows, components: 1).call.explained_variance.first
      demo_variance = centered.sum { |r| r.sum { |v| v * v } }
      scale = demo_variance.zero? ? 0.0 : Math.sqrt(@options.demographic_weight * first_axis_variance / demo_variance)

      @rows.each_with_index { |row, i| row.concat(centered[i].map { |v| v * scale }) }
    end

    # --- Step 3 & 4: PCA and clustering ---------------------------------------

    def reduce_dimensions
      @pca = Pca.new(@rows, components: 2).call
      @coordinates = @pca.scores
    end

    def cluster
      @k_candidates = []
      if @coordinates.empty?
        @labels = []
        @silhouette = 0.0
        return
      end

      run = if @options.k
        KMeans.new(@coordinates, k: @options.k).call
      else
        run, @k_candidates = KMeans.auto(@coordinates)
        run
      end

      # Relabel so that group 0 is the largest group.
      sizes = run.labels.tally
      order = sizes.keys.sort_by { |label| [-sizes[label], label] }
      relabel = order.each_with_index.to_h
      @labels = run.labels.map { |l| relabel[l] }
      @silhouette = run.silhouette
    end

    # --- Step 5: statistics ---------------------------------------------------

    def compute_group_statistics
      @group_count = @labels.uniq.size
      @members = (0...@group_count).map { |g| @participant_ids.each_index.select { |i| @labels[i] == g } }

      # counts[statement_index][group] = { up:, down:, neutral: }
      @counts = @statement_ids.map { (0...@group_count).map { { 'up' => 0, 'down' => 0, 'neutral' => 0 } } }
      @participant_ids.each_with_index do |u, i|
        g = @labels[i]
        @votes[u].each do |idea_id, mode|
          j = @statement_index[idea_id] or next
          @counts[j][g][mode] += 1
        end
      end

      @groups = (0...@group_count).map { |g| group_summary(g) }
      @consensus = consensus_statements
      @divisive = divisive_statements
    end

    def group_summary(group)
      member_indices = @members[group]
      centroid = mean_coordinates(member_indices)
      {
        id: group,
        name: ('A'.ord + group).chr,
        size: member_indices.size,
        share: (member_indices.size.to_f / @participant_ids.size).round(3),
        centroid: { x: centroid[0].round(4), y: centroid[1].round(4) },
        representative: representative_statements(group),
        demographics: group_demographics(member_indices)
      }
    end

    def mean_coordinates(indices)
      return [0.0, 0.0] if indices.empty?

      [0, 1].map { |d| indices.sum { |i| @coordinates[i][d] } / indices.size }
    end

    # Statements on which the group differs most from everyone else. Uses a
    # two-proportion z-test with pseudo counts, in the spirit of Polis'
    # "representativeness" metric.
    def representative_statements(group)
      candidates = @statement_ids.each_index.flat_map do |j|
        inside = @counts[j][group]
        outside = (0...@group_count).reject { |g| g == group }.map { |g| @counts[j][g] }
        n_in = inside.values.sum
        n_out = outside.sum { |c| c.values.sum }
        next [] if n_in < MIN_GROUP_VOTES

        DIRECTIONAL_MODES.map do |mode|
          a_in = inside[mode]
          a_out = outside.sum { |c| c[mode] }
          p_in = (a_in + 1.0) / (n_in + 2)
          p_out = (a_out + 1.0) / (n_out + 2)
          {
            statement_id: @statement_ids[j],
            direction: mode == 'up' ? 'agree' : 'disagree',
            inside_share: p_in.round(3),
            outside_share: p_out.round(3),
            inside_votes: n_in,
            z: z_score(a_in, n_in, a_out, n_out).round(2)
          }
        end
      end

      candidates
        .select { |c| c[:z].positive? }
        .sort_by { |c| -c[:z] }
        .first(TOP_N)
    end

    def z_score(a1, n1, a2, n2)
      p1 = (a1 + 1.0) / (n1 + 2)
      p2 = (a2 + 1.0) / (n2 + 2)
      pooled = (a1 + a2 + 2.0) / (n1 + n2 + 4)
      variance = pooled * (1 - pooled) * ((1.0 / (n1 + 2)) + (1.0 / (n2 + 2)))
      return 0.0 if variance <= 0

      (p1 - p2) / Math.sqrt(variance)
    end

    # Agreement share per group, with pseudo counts so that tiny groups do not
    # produce extreme values.
    def group_shares(j, mode)
      (0...@group_count).map do |g|
        counts = @counts[j][g]
        n = counts.values.sum
        n < MIN_GROUP_VOTES ? nil : ((counts[mode] + 1.0) / (n + 2)).round(3)
      end
    end

    # Statements every group agrees (or disagrees) with: the lowest group
    # share is still high.
    def consensus_statements
      return [] if @group_count < 2

      candidates = @statement_ids.each_index.flat_map do |j|
        DIRECTIONAL_MODES.filter_map do |mode|
          shares = group_shares(j, mode)
          next if shares.any?(&:nil?)

          {
            statement_id: @statement_ids[j],
            direction: mode == 'up' ? 'agree' : 'disagree',
            score: shares.min,
            group_shares: shares
          }
        end
      end
      candidates.select { |c| c[:score] >= 0.5 }.sort_by { |c| -c[:score] }.first(TOP_N)
    end

    # Statements where the groups disagree the most with each other.
    def divisive_statements
      return [] if @group_count < 2

      candidates = @statement_ids.each_index.filter_map do |j|
        shares = group_shares(j, 'up')
        next if shares.any?(&:nil?)

        { statement_id: @statement_ids[j], spread: (shares.max - shares.min).round(3), group_shares: shares }
      end
      candidates.sort_by { |c| -c[:spread] }.first(TOP_N)
    end

    # Composition of a group per demographic field, compared with all included
    # participants. Small cells are suppressed to protect privacy.
    def group_demographics(member_indices)
      @demographics.fields.map do |field|
        group_counts = member_indices.map { |i| @categories_by_user[@participant_ids[i]][field.key] }.tally
        overall_counts = overall_category_counts[field.key]
        known_in_group = field.categories.sum { |c| group_counts[c.key] || 0 }
        known_overall = field.categories.sum { |c| overall_counts[c.key] || 0 }

        {
          field_key: field.key,
          unknown: group_counts[nil] || 0,
          categories: field.categories.map do |category|
            count = group_counts[category.key] || 0
            suppressed = count.positive? && count < @options.privacy_threshold
            share = known_in_group.zero? ? nil : (count.to_f / known_in_group).round(3)
            overall_share = known_overall.zero? ? nil : ((overall_counts[category.key] || 0).to_f / known_overall).round(3)
            {
              key: category.key,
              count: suppressed ? nil : count,
              share: suppressed ? nil : share,
              overall_share: overall_share,
              index: suppressed || share.nil? || overall_share.nil? || overall_share.zero? ? nil : (share / overall_share).round(2),
              suppressed: suppressed
            }
          end
        }
      end
    end

    def overall_category_counts
      @overall_category_counts ||= @demographics.fields.to_h do |field|
        [field.key, @participant_ids.map { |u| @categories_by_user[u][field.key] }.tally]
      end
    end

    # Task 4.4: who takes part, compared with the registered user base. Flags
    # under- and over-represented demographic categories among the voters.
    def participation_balance
      voter_values = User.where(id: @all_voter_ids).pluck(:custom_field_values)
      population_values = User.active.pluck(:custom_field_values)
      voter_categories = voter_values.map { |v| @demographics.categorize(v) }
      population_categories = population_values.map { |v| @demographics.categorize(v) }

      @demographics.fields.map do |field|
        voter_counts = voter_categories.map { |c| c[field.key] }.tally
        population_counts = population_categories.map { |c| c[field.key] }.tally
        known_voters = field.categories.sum { |c| voter_counts[c.key] || 0 }
        known_population = field.categories.sum { |c| population_counts[c.key] || 0 }

        {
          field_key: field.key,
          voters_known: known_voters,
          population_known: known_population,
          categories: field.categories.map do |category|
            count = voter_counts[category.key] || 0
            suppressed = count.positive? && count < @options.privacy_threshold
            share = known_voters.zero? ? nil : (count.to_f / known_voters).round(3)
            population_share = known_population.zero? ? nil : ((population_counts[category.key] || 0).to_f / known_population).round(3)
            {
              key: category.key,
              voters_count: suppressed ? nil : count,
              voters_share: suppressed ? nil : share,
              population_share: population_share,
              index: suppressed || share.nil? || population_share.nil? || population_share.zero? ? nil : (share / population_share).round(2),
              suppressed: suppressed
            }
          end
        }
      end
    end

    # --- Output ---------------------------------------------------------------

    def stats
      {
        participants_total: @all_voter_ids.size,
        participants_included: @participant_ids.size,
        statements_total: @ideas.size,
        statements_included: @statement_ids.size,
        votes_total: @votes_total,
        votes_included: @participant_ids.sum { |u| @votes[u].count { |i, _| @statement_index.key?(i) } },
        group_count: @group_count,
        silhouette: @silhouette.round(3),
        k_candidates: @k_candidates,
        explained_variance: @pca.explained_variance.map { |v| v.round(3) }
      }
    end

    def serialized_statements
      @statement_ids.each_with_index.map do |idea_id, j|
        idea = @ideas_by_id[idea_id]
        per_group = @counts[j]
        {
          id: idea_id,
          title_multiloc: idea.title_multiloc,
          votes: per_group.reduce({ 'up' => 0, 'down' => 0, 'neutral' => 0 }) { |acc, c| acc.merge(c) { |_k, a, b| a + b } },
          group_votes: per_group,
          group_agree_share: group_shares(j, 'up')
        }
      end
    end

    # Which statements (and demographic categories) pull each axis. This helps
    # to read the scatter plot.
    def axes
      %w[x y].each_with_index.to_h do |axis, component|
        loadings = @pca.loadings[component] || []
        statements = @statement_ids.each_with_index.map { |id, j| { statement_id: id, loading: (loadings[j] || 0.0).round(3) } }
        demographics = (@demographic_columns || []).each_with_index.map do |(field_key, category_key), j|
          { field_key: field_key, category_key: category_key, loading: (loadings[@statement_ids.size + j] || 0.0).round(3) }
        end
        [
          axis,
          {
            explained_variance: (@pca.explained_variance[component] || 0.0).round(3),
            positive: statements.select { |s| s[:loading].positive? }.sort_by { |s| -s[:loading] }.first(3),
            negative: statements.select { |s| s[:loading].negative? }.sort_by { |s| s[:loading] }.first(3),
            demographics: demographics.sort_by { |d| -d[:loading].abs }.first(3)
          }
        ]
      end
    end

    # One point per included participant. No user ids are exposed, and
    # demographic values of small categories are hidden.
    def points
      visible = @demographics.fields.to_h do |field|
        counts = overall_category_counts[field.key]
        [field.key, field.categories.map(&:key).select { |k| (counts[k] || 0) >= @options.privacy_threshold }.to_set]
      end

      @participant_ids.each_with_index.map do |u, i|
        categories = @categories_by_user[u]
        {
          x: @coordinates[i][0].round(4),
          y: @coordinates[i][1].round(4),
          group: @labels[i],
          votes: @votes[u].count { |idea_id, _| @statement_index.key?(idea_id) },
          demographics: categories.to_h { |key, value| [key, visible[key].include?(value) ? value : nil] }
        }
      end
    end
  end
end
