# frozen_string_literal: true

module Analysis
  class InputsFinder
    MAX_PER_PAGE = 100

    attr_reader :analysis, :params

    def initialize(analysis, params = {})
      @analysis = analysis
      @params = params
    end

    def execute
      inputs = analysis.inputs

      inputs = filter_tags(inputs)
      inputs = filter_published_at(inputs)
      inputs = filter_reactions(inputs)
      inputs = filter_comments(inputs)
      inputs = filter_votes(inputs)
      inputs = filter_custom_field_in(inputs)
      inputs = filter_custom_field_range(inputs)
      search(inputs)
    end

    private

    def filter_tags(inputs)
      return inputs unless params[:tag_ids]

      raise ArgumentError, 'value specified for tag_ids must be an array' unless params[:tag_ids].is_a? Array

      if params[:tag_ids].empty?
        inputs.where.missing(:taggings)
      else
        inputs.joins(:taggings).where(taggings: { tag_id: params[:tag_ids] }).distinct
      end
    end

    def filter_published_at(inputs)
      scope = inputs

      scope = scope.where('published_at >= ?', params[:published_at_from]) if params[:published_at_from]
      scope = scope.where('published_at <= ?', params[:published_at_to]) if params[:published_at_to]

      scope
    end

    def filter_reactions(inputs)
      scope = inputs

      scope = scope.where('dislikes_count + likes_count >= ?', params[:reactions_from]) if params[:reactions_from]
      scope = scope.where('dislikes_count + likes_count <= ?', params[:reactions_to]) if params[:reactions_to]

      scope
    end

    def filter_comments(inputs)
      scope = inputs

      scope = scope.where('comments_count >= ?', params[:comments_from]) if params[:comments_from]
      scope = scope.where('comments_count <= ?', params[:comments_to]) if params[:comments_to]

      scope
    end

    def filter_votes(inputs)
      scope = inputs

      scope = scope.where('votes_count >= ?', params[:votes_from]) if params[:votes_from]
      scope = scope.where('votes_count <= ?', params[:votes_to]) if params[:votes_to]

      scope
    end

    def search(inputs)
      return inputs unless (search = params[:search])

      inputs.search_by_all(search)
    end

    def filter_custom_field_in(inputs)
      scope = inputs

      decode_author_in_custom_keys.each do |(custom_field_id, value)|
        raise ArgumentError, "value specified for author_custom_#{custom_field_id} must be an array" unless value.is_a? Array

        cf = CustomField.find(custom_field_id)
        
        case cf.input_type
        when 'select', 'date'
          scope = if value.empty?
            scope.joins(:author).where("users.custom_field_values->>'#{cf.key}' IS NULL")
          else
            scope.joins(:author).where("users.custom_field_values->>'#{cf.key}' IN (?)", value)
          end
        when 'multiselect'
          scope = if value.empty?
            scope.joins(:author).where("users.custom_field_values->>'#{cf.key}' IS NULL OR jsonb_array_length(users.custom_field_values->'#{cf.key}') = 0")
          else
            scope.joins(:author).where("(users.custom_field_values->>'#{cf.key}')::jsonb ?| array[:value]", value: value)
          end
        when 'number'
          scope = if value.empty?
            scope.joins(:author).where("users.custom_field_values->>'#{cf.key}' IS NULL")
          else
            scope.joins(:author).where("(users.custom_field_values->'#{cf.key}')::numeric IN (?)", value)
          end
        else
          raise ArgumentError, "author_custom_<uuid>[] filter on custom field of type #{cf.input_type} is not supported"
        end
      end

      scope
    end

    def filter_custom_field_range(inputs)
      scope = inputs
      decode_author_range_custom_keys.each do |(custom_field_id, predicate, value)|
        cf = CustomField.find(custom_field_id)

        scope = if predicate == 'from'
          scope.joins(:author).where("(users.custom_field_values->'#{cf.key}')::numeric >= ?", value)
        elsif predicate == 'to'
          scope.joins(:author).where("(users.custom_field_values->'#{cf.key}')::numeric <= ?", value)
        else
          raise ArgumentError, "invalid predicate #{predicate}"
        end
      end
      scope
    end

    def decode_author_in_custom_keys
      params.filter_map do |key, value|
        matches = key.to_s.match(/^author_custom_([a-f0-9-]+)$/)
        # return pair [custom_field_id, value]
        matches && [matches[1], value]
      end
    end

    def decode_author_range_custom_keys
      params.filter_map do |key, value|
        matches = key.to_s.match(/^author_custom_([a-f0-9-]+)_(from|to)$/)
        # return triplet [custom_field_id, predicate, value]
        matches && [matches[1], matches[2], value]
      end
    end
  end
end
