# frozen_string_literal: true

module Analysis
  class TagStats
    def initialize(tags)
      @tags = tags
    end

    #          tag1
    #  ┌───────────────────┐
    #  │    diff           │   tag2
    #  │     ┌─────────────┼────┐
    #  │     │intersection │    │
    #  └─────┼─────────────┘    │
    #        │                  │
    #        └──────────────────┘
    def co_occurence_matrix
      @co_occurence_matrix ||= @tags.index_with do |tag1|
        @tags.index_with do |tag2|
          {
            diff: tag_diff_count(tag1, tag2),
            intersection: tag_intersection(tag1, tag2)
          }
        end
      end
    end

    # A dependent tag is a tag for which all inputs are contained in another
    # tag. Also called a subtag. This returns all dependent tags and their
    # parents.
    def dependent_tags
      co_occurence_matrix.filter_map do |tag, potential_parents|
        parents = potential_parents.select do |parent, stats|
          next if parent == tag

          stats[:diff] == 0 && stats[:intersection] > 0
        end
        parents.empty? ? nil : { tag => parents.map(&:first) }
      end.compact.inject(&:merge)
    end

    private

    def tag_diff_count(tag1, tag2)
      (tag_input_ids(tag1) - tag_input_ids(tag2)).size
    end

    def tag_intersection(tag1, tag2)
      (tag_input_ids(tag1) & tag_input_ids(tag2)).size
    end

    def tag_input_ids(tag)
      tag_input_ids_map[tag.id] || []
    end

    def tag_input_ids_map
      @tag_input_ids_map = taggings
        .group_by(&:tag_id)
        .transform_values { |taggings| taggings.pluck(:input_id) }
    end

    def taggings
      @taggings ||= Tagging.where(tag: @tags)
    end
  end
end
