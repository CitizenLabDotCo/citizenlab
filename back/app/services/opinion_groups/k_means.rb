# frozen_string_literal: true

module OpinionGroups
  # K-means clustering with k-means++ seeding and several restarts.
  #
  # The random generator is seeded, so the same input always gives the same
  # groups. This keeps the admin page stable between reloads.
  class KMeans
    Result = Struct.new(:labels, :centroids, :inertia, :silhouette, keyword_init: true)

    MIN_K = 2
    MAX_K = 5
    MIN_GROUP_SIZE = 3

    def initialize(points, k:, restarts: 10, max_iterations: 100, seed: 42)
      @points = points
      @k = k
      @restarts = restarts
      @max_iterations = max_iterations
      @seed = seed
    end

    # Runs k-means for each candidate k and returns the run with the best
    # silhouette score, together with all candidate scores.
    #
    # A run only qualifies when each group has at least `min_group_share` of
    # the points (and at least MIN_GROUP_SIZE points). This stops a handful of
    # outliers from becoming a group of their own.
    # @return [Array(Result, Array<Hash>)]
    def self.auto(points, seed: 42, min_group_share: 0.02)
      min_group_size = [MIN_GROUP_SIZE, (points.size * min_group_share).ceil].max
      max_k = [MAX_K, points.size / min_group_size].min
      candidates = (MIN_K..max_k).to_a
      return [new(points, k: 1, seed: seed).call, []] if candidates.empty?

      runs = candidates.map do |k|
        run = new(points, k: k, seed: seed).call
        smallest = run.labels.tally.values.min
        [k, run, smallest >= min_group_size]
      end
      qualifying = runs.select { |_k, _run, ok| ok }
      best = (qualifying.presence || runs.first(1)).max_by { |_k, run, _ok| run.silhouette }
      scores = runs.map { |k, run, ok| { k: k, silhouette: run.silhouette.round(3), qualifies: ok } }
      [best[1], scores]
    end

    def call
      return single_cluster if @k <= 1 || @points.size <= @k

      best = nil
      @restarts.times do |restart|
        rng = Random.new(@seed + restart)
        centroids = seed_centroids(rng)
        labels = nil

        @max_iterations.times do
          new_labels = @points.map { |p| nearest(centroids, p) }
          break if new_labels == labels

          labels = new_labels
          centroids = recompute_centroids(labels, centroids)
        end

        inertia = @points.each_with_index.sum { |p, i| squared_distance(p, centroids[labels[i]]) }
        best = { labels: labels, centroids: centroids, inertia: inertia } if best.nil? || inertia < best[:inertia]
      end

      Result.new(
        labels: best[:labels],
        centroids: best[:centroids],
        inertia: best[:inertia],
        silhouette: silhouette(best[:labels])
      )
    end

    private

    def single_cluster
      centroid = mean_point(@points)
      inertia = @points.sum { |p| squared_distance(p, centroid) }
      Result.new(labels: Array.new(@points.size, 0), centroids: [centroid], inertia: inertia, silhouette: 0.0)
    end

    # k-means++ seeding: each next centroid is drawn with a probability that is
    # proportional to its squared distance from the nearest existing centroid.
    def seed_centroids(rng)
      centroids = [@points[rng.rand(@points.size)]]
      while centroids.size < @k
        distances = @points.map { |p| centroids.map { |c| squared_distance(p, c) }.min }
        total = distances.sum
        if total <= 0
          centroids << @points[rng.rand(@points.size)]
          next
        end
        target = rng.rand * total
        cumulative = 0.0
        chosen = @points.last
        @points.each_with_index do |p, i|
          cumulative += distances[i]
          if cumulative >= target
            chosen = p
            break
          end
        end
        centroids << chosen
      end
      centroids
    end

    def recompute_centroids(labels, previous)
      (0...@k).map do |cluster|
        members = @points.each_index.select { |i| labels[i] == cluster }.map { |i| @points[i] }
        members.empty? ? previous[cluster] : mean_point(members)
      end
    end

    def nearest(centroids, point)
      centroids.each_index.min_by { |i| squared_distance(point, centroids[i]) }
    end

    def mean_point(points)
      dims = points.first.size
      sums = Array.new(dims, 0.0)
      points.each { |p| p.each_with_index { |v, d| sums[d] += v } }
      sums.map { |s| s / points.size }
    end

    def squared_distance(a, b)
      sum = 0.0
      a.each_with_index { |v, i| sum += (v - b[i])**2 }
      sum
    end

    # Mean silhouette coefficient. Uses a sample when there are many points to
    # keep the cost bounded.
    def silhouette(labels, sample_size: 1000)
      n = @points.size
      return 0.0 if n < 2

      clusters = labels.uniq
      return 0.0 if clusters.size < 2

      rng = Random.new(@seed)
      indices = n > sample_size ? (0...n).to_a.sample(sample_size, random: rng) : (0...n).to_a

      by_cluster = labels.each_index.group_by { |i| labels[i] }
      values = indices.filter_map do |i|
        own = by_cluster[labels[i]]
        next if own.size < 2

        a = own.sum { |j| j == i ? 0.0 : Math.sqrt(squared_distance(@points[i], @points[j])) } / (own.size - 1)
        b = by_cluster.except(labels[i]).values.map do |others|
          others.sum { |j| Math.sqrt(squared_distance(@points[i], @points[j])) } / others.size
        end.min
        denominator = [a, b].max
        denominator.zero? ? 0.0 : (b - a) / denominator
      end

      values.empty? ? 0.0 : values.sum / values.size
    end
  end
end
