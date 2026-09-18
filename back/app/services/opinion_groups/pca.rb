# frozen_string_literal: true

module OpinionGroups
  # Principal component analysis with the NIPALS algorithm.
  #
  # The input rows must be centered (each column has mean 0). NIPALS only
  # touches the data matrix, so it is cheap for the tall, sparse matrices we
  # get from votes (many participants, fewer statements). No native extension
  # is necessary.
  class Pca
    Result = Struct.new(:scores, :loadings, :explained_variance, keyword_init: true)

    def initialize(rows, components: 2, max_iterations: 100, tolerance: 1e-8)
      @rows = rows.map(&:dup)
      @components = components
      @max_iterations = max_iterations
      @tolerance = tolerance
    end

    def call
      n_rows = @rows.size
      n_cols = @rows.first&.size || 0
      total_variance = @rows.sum { |row| row.sum { |v| v * v } }

      scores = Array.new(n_rows) { [] }
      loadings = []
      explained = []

      @components.times do
        if n_rows.zero? || n_cols.zero? || total_variance <= 0
          scores.each { |s| s << 0.0 }
          loadings << Array.new(n_cols, 0.0)
          explained << 0.0
          next
        end

        t = initial_score_vector
        p = nil

        @max_iterations.times do
          p = normalize(columns_dot(t))
          t_new = @rows.map { |row| dot(row, p) }
          delta = t_new.each_with_index.sum { |v, i| (v - t[i])**2 }
          norm = t_new.sum { |v| v * v }
          t = t_new
          break if norm.zero? || delta / norm < @tolerance
        end

        t_variance = t.sum { |v| v * v }
        scores.each_with_index { |s, i| s << t[i] }
        loadings << p
        explained << (t_variance / total_variance)

        # Deflate: remove the found component from the data.
        @rows.each_with_index do |row, i|
          row.each_index { |j| row[j] -= t[i] * p[j] }
        end
      end

      Result.new(scores: scores, loadings: loadings, explained_variance: explained)
    end

    private

    # Start from the column with the largest norm. This is deterministic and
    # usually close to the first principal component.
    def initial_score_vector
      n_cols = @rows.first.size
      best_col = (0...n_cols).max_by { |j| @rows.sum { |row| row[j]**2 } }
      t = @rows.pluck(best_col)
      t = @rows.map(&:sum) if t.all?(&:zero?)
      t = Array.new(@rows.size, 1.0) if t.all?(&:zero?)
      t
    end

    # X^T t
    def columns_dot(t)
      n_cols = @rows.first.size
      result = Array.new(n_cols, 0.0)
      @rows.each_with_index do |row, i|
        ti = t[i]
        next if ti.zero?

        row.each_with_index { |v, j| result[j] += v * ti }
      end
      result
    end

    def normalize(vector)
      norm = Math.sqrt(vector.sum { |v| v * v })
      return vector.map { 0.0 } if norm.zero?

      vector.map { |v| v / norm }
    end

    def dot(a, b)
      sum = 0.0
      a.each_with_index { |v, i| sum += v * b[i] }
      sum
    end
  end
end
