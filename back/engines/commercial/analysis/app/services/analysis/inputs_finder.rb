# frozen_string_literal: true

module Analysis
  class InputsFinder
    attr_reader :analysis, :params

    def initialize(analysis, params = {})
      @analysis = analysis
      @params = params
    end

    def execute
      inputs = analysis.inputs

      inputs = filter_tags(inputs)
      inputs = filter_input_custom_field_no_empty_values(inputs)
      inputs = filter_published_at(inputs)
      inputs = filter_reactions(inputs)
      inputs = filter_comments(inputs)
      inputs = filter_votes(inputs)
      inputs = filter_author_custom_field_in(inputs)
      inputs = filter_author_custom_field_range(inputs)
      inputs = filter_input_custom_field_in(inputs)
      inputs = filter_input_custom_field_range(inputs)
      inputs = filter_limit(inputs)
      search(inputs)
    end

    private

    def filter_tags(inputs)
      return inputs unless params[:tag_ids]

      raise ArgumentError, 'value specified for tag_ids must be an array' unless params[:tag_ids].is_a? Array

      if params[:tag_ids].include?(nil)
        inputs_in_analysis_with_tags = Tagging.joins(:tag).where(tag: { analysis: analysis }).select(:input_id)
        inputs.where.not(id: inputs_in_analysis_with_tags)
      else
        # We use a subquery because we need to make sure multiple taggings for
        # the same inputs don't result in duplication of those inputs in the
        # final output. Solving this with `distinct` breaks the query in
        # combination with pg_search, so this is a relatively elegant workaround
        subquery = inputs.select(:id).joins(:taggings).where(taggings: { tag_id: params[:tag_ids] })
        inputs.where(id: subquery)
      end
    end

    def filter_input_custom_field_no_empty_values(inputs)
      scope = inputs
      if params[:input_custom_field_no_empty_values] && analysis.main_custom_field_id
        scope = scope.where.not("ideas.custom_field_values->>'#{analysis.main_custom_field.key}' IS NULL")
      end
      scope
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

    def filter_author_custom_field_in(inputs)
      scope = inputs

      decode_author_in_custom_keys.each do |(custom_field_id, value)|
        raise ArgumentError, "value specified for author_custom_#{custom_field_id} must be an array" unless value.is_a? Array

        cf = CustomField.find(custom_field_id)

        # domcile custom_field is stored differently, so we need to convert
        # custom_field_option keys to area ids
        value = convert_domicile_value(value) if cf.domicile?

        case cf.input_type
        when 'select', 'date'
          scope = if value.include?(nil)
            scope.joins(:author).where("users.custom_field_values->>'#{cf.key}' IS NULL")
          else
            scope.joins(:author).where("users.custom_field_values->>'#{cf.key}' IN (?)", value)
          end
        when 'multiselect'
          scope = if value.include?(nil)
            scope.joins(:author).where("users.custom_field_values->>'#{cf.key}' IS NULL OR jsonb_array_length(users.custom_field_values->'#{cf.key}') = 0")
          else
            scope.joins(:author).where("(users.custom_field_values->>'#{cf.key}')::jsonb ?| array[:value]", value: value)
          end
        when 'number'
          scope = if value.include?(nil)
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

    def filter_author_custom_field_range(inputs)
      scope = inputs
      decode_author_range_custom_keys.each do |(custom_field_id, predicate, value)|
        cf = CustomField.find(custom_field_id)

        scope = if predicate == 'from'
          scope.joins(:author).where("coalesce(users.custom_field_values->>'#{cf.key}', (-99999)::text)::numeric >= ?", value)
        elsif predicate == 'to'
          scope.joins(:author).where("coalesce(users.custom_field_values->>'#{cf.key}', (99999)::text)::numeric <= ?", value)
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

    def filter_input_custom_field_in(inputs)
      scope = inputs

      decode_input_in_custom_keys.each do |(custom_field_id, value)|
        raise ArgumentError, "value specified for input_custom_#{custom_field_id} must be an array" unless value.is_a? Array

        cf = CustomField.find(custom_field_id)

        case cf.input_type
        when 'select', 'date'
          scope = if value.include?(nil)
            scope.where("ideas.custom_field_values->>'#{cf.key}' IS NULL")
          else
            scope.where("ideas.custom_field_values->>'#{cf.key}' IN (?)", value)
          end
        when 'multiselect', 'multiselect_image'
          scope = if value.include?(nil)
            scope.where("ideas.custom_field_values->>'#{cf.key}' IS NULL OR jsonb_array_length(ideas.custom_field_values->'#{cf.key}') = 0")
          else
            scope.where("(ideas.custom_field_values->>'#{cf.key}')::jsonb ?| array[:value]", value: value)
          end
          scope = if value.include?(nil)
            scope.where("ideas.custom_field_values->>'#{cf.key}' IS NULL OR jsonb_array_length(ideas.custom_field_values->'#{cf.key}') = 0")
          else
            scope.where("(ideas.custom_field_values->>'#{cf.key}')::jsonb ?| array[:value]", value: value)
          end
        when 'number', 'linear_scale', 'rating', 'sentiment_linear_scale'
          scope = if value.include?(nil)
            scope.where("ideas.custom_field_values->>'#{cf.key}' IS NULL")
          else
            scope.where("(ideas.custom_field_values->'#{cf.key}')::numeric IN (?)", value)
          end
        else
          raise ArgumentError, "input_custom_<uuid>[] filter on custom field of type #{cf.input_type} is not supported"
        end
      end

      scope
    end

    def filter_input_custom_field_range(inputs)
      scope = inputs
      decode_input_range_custom_keys.each do |(custom_field_id, predicate, value)|
        cf = CustomField.find(custom_field_id)

        scope = if predicate == 'from'
          scope.where("(ideas.custom_field_values->'#{cf.key}')::numeric >= ?", value)
        elsif predicate == 'to'
          scope.where("(ideas.custom_field_values->'#{cf.key}')::numeric <= ?", value)
        else
          raise ArgumentError, "invalid predicate #{predicate}"
        end
      end
      scope
    end

    def filter_limit(inputs)
      return inputs unless params[:limit]
      raise ArgumentError, 'limit must be a positive integer' unless params[:limit].to_i.positive?

      inputs.where(id: inputs.limit(params[:limit]))
    end

    def decode_input_in_custom_keys
      params.filter_map do |key, value|
        matches = key.to_s.match(/^input_custom_([a-f0-9-]+)$/)
        # return pair [custom_field_id, value]
        matches && [matches[1], value]
      end
    end

    def decode_input_range_custom_keys
      params.filter_map do |key, value|
        matches = key.to_s.match(/^input_custom_([a-f0-9-]+)_(from|to)$/)
        # return triplet [custom_field_id, predicate, value]
        matches && [matches[1], matches[2], value]
      end
    end

    # Domicile is a special user custom_field, which stores the area.id as the
    # value in user.custom_field_values, instead of the key value of the
    # custom_field option. Historically, the domicile custom_field did not have
    # any custom_field_option database records. At some point, we added a
    # mechanism to sync areas to custom_field_options for domicile. But the work
    # to change the actual value stored in custom_field_values was not
    # completed. This means that the front-end can treat the domicile field as
    # any other field, but we need to convert the option_key to the right
    # area_id in order for the filter to work. Also see
    # back/engines/commercial/user_custom_fields/app/services/user_custom_fields/field_value_counter.rb:37
    def convert_domicile_value(option_keys)
      return [nil] if option_keys == [nil]

      area_ids = CustomFieldOption.where(key: option_keys).filter_map do |option|
        option&.area&.id
      end

      area_ids << 'outside' if option_keys.include? 'somewhere_else'

      area_ids
    end
  end
end
