# frozen_string_literal: true

# The AutoInsightsService combines all input custom_fields, user custom_fields
# and tags relevant to an analysis, and generates heatmaps between all fields
# and tags. The heatmaps express whether (a) there is a significant (chi-square
# test) relationship between a specific input field bin and/or tag, and what the
# lift (the difference compared to the expected value extrapolated from the
# other data) is.
module Analysis
  class AutoInsightsService
    def initialize(analysis)
      @analysis = analysis
    end

    def generate(unit: 'inputs', tags: detect_tags, user_custom_fields: detect_user_custom_fields, input_custom_fields: detect_input_custom_fields)
      matrix = big_fat_matrix(unit, tags:, user_custom_fields:, input_custom_fields:)

      matrix
        .flat_map(&:keys)
        .uniq # => [col1, col2, col3]
        .group_by { |col| col_to_category(col) } # => { category1 => [col1, col2], category2 => [col3] }
        .to_a # => [[category1, [col1, col2]], [category2, [col3]]]
        .combination(2) # => [[[category1, [col1, col2]], [category2, [col3]]]]
        .select { |(category1, category2)| heatmap_between_categories?(category1[0], category2[0]) }
        .each do |(category1, category2)|
        cols1 = category1[1]
        cols2 = category2[1]
        cells =
          cols1.flat_map do |col1|
            cols2.map do |col2|
              ct = contingency_table(matrix, col1, col2)
              count = ct[[true, true]]
              _chi2, p_value = chi_square(ct)
              HeatmapCell.new(
                analysis: @analysis,
                row: col1,
                column: col2,
                unit:,
                p_value:,
                count:
              )
            end
          end

        add_lift!(cells)

        HeatmapCell.insert_all!(
          cells.map do |cell|
            cell.attributes.except('id', 'created_at', 'updated_at')
              .merge(
                created_at: Time.current,
                updated_at: Time.current
              )
          end
        )
      end
    end

    # The big fat matrix takes the given, or all inputs, user custom fields and taggings and
    # throws them together in a large, one-hot (only booleans) encoded table
    # example output:
    # [
    #   { tag1: true,  tag2: false, bin(male): true, bin(female): false },
    #   { tag1: false, tag2: true,  bin(male): true, bin(female): false },
    # ]
    def big_fat_matrix(unit, **)
      case unit
      when 'inputs'
        big_fat_matrix_helper(
          items: @analysis.inputs.includes(:author),
          inputs_custom_field_values: ->(item) { [item.custom_field_values] },
          author: ->(item) { item.author },
          input_ids: ->(item) { [item.id] },
          **
        )
      when 'likes', 'dislikes'
        big_fat_matrix_helper(
          items: Reaction
            .where(reactable_type: 'Idea', reactable_id: @analysis.inputs, mode: unit == 'likes' ? 'up' : 'down')
            .includes(:user, :reactable),
          inputs_custom_field_values: ->(reaction) { [reaction.reactable.custom_field_values] },
          author: ->(reaction) { reaction.user },
          input_ids: ->(reaction) { [reaction.reactable_id] },
          **
        )
      when 'participants'
        big_fat_matrix_helper(
          items: participant_to_inputs_map.keys,
          inputs_custom_field_values: ->(participant) { participant_to_inputs_map[participant].map(&:custom_field_values) },
          author: ->(participant) { participant },
          input_ids: ->(participant) { participant_to_inputs_map[participant].map(&:id) },
          **
        )
      else
        raise "Invalid unit #{unit}"
      end
    end

    def big_fat_matrix_helper(
      items:,
      inputs_custom_field_values:,
      author:,
      input_ids:,
      tags:,
      user_custom_fields:,
      input_custom_fields:
    )
      input_custom_field_bins = input_custom_fields.flat_map { |custom_field| custom_field_bins(custom_field) }
      user_custom_field_bins = user_custom_fields.flat_map { |custom_field| custom_field_bins(custom_field) }

      items.map do |item|
        row = {}

        # Add columns for tags
        ids = input_ids.call(item)
        tags.each do |tag|
          row[tag] = ids.any? { |id| tag_map(tags).dig(id, tag.id) }
        end

        # Add columns for input custom fields
        input_custom_field_bins.each do |bin|
          multiple_cfvs = inputs_custom_field_values.call(item)
          row[bin] = multiple_cfvs.any? { |cfv| bin.in_bin?(cfv[bin.custom_field.key]) }
        end

        # Add columns for user custom fields
        if (item_author = author.call(item))
          cfv = item_author.custom_field_values
          user_custom_field_bins.each do |bin|
            row[bin] = !!bin.in_bin?(cfv[bin.custom_field.key])
          end
        end

        row
      end
    end

    private

    def col_to_category(col)
      case col
      when CustomFieldBin
        col.custom_field
      when Tag
        :tags
      else
        raise 'Invalid column type'
      end
    end

    # We don't genereate heatmap cells between all types of columns, as some
    # combinations between tags, user custom fields and input custom fields make
    # little sense or are not as valuable
    def heatmap_between_categories?(category1, category2)
      cat1_type, cat2_type = [category1, category2].map do |category|
        case category
        when :tags
          :tags
        when CustomField
          if category.custom_form_type?
            :input_custom_field
          else
            :user_custom_field
          end
        else
          raise 'Invalid category type'
        end
      end

      allowed_combinations = [
        Set.new(%i[tags user_custom_field]),
        Set.new(%i[tags input_custom_field]),
        Set.new(%i[user_custom_field input_custom_field]),
        Set.new([:input_custom_field])
      ]
      allowed_combinations.include?([cat1_type, cat2_type].to_set)
    end

    def detect_input_custom_fields
      CustomField.where(id: @analysis.associated_custom_fields).includes(:options)
    end

    def detect_user_custom_fields
      CustomField.registration.enabled.includes(:options)
    end

    def detect_tags
      @analysis.tags
    end

    def custom_field_bins(custom_field)
      CustomFieldBin.find_bin_claz_for(custom_field)&.generate_bins(custom_field)
      bins = custom_field.custom_field_bins.includes(:custom_field)
      ActiveRecord::Associations::Preloader.new(
        records: bins.filter { |bin| bin.is_a?(CustomFieldBins::OptionBin) },
        associations: { custom_field_option: [:area] }
      ).call
      bins
    end

    # Nested hash to quickly check whether a certain input has a certain tag.
    # Purely a performance optimization.
    def tag_map(tags)
      @tag_map ||= {}
      @tag_map[tags] ||=
        Tagging.where(tag: tags)
          .select(:input_id, :tag_id)
          .group_by(&:input_id)
          .transform_values { |taggings| taggings.each_with_object({}) { |tagging, hash| hash[tagging.tag_id] = true } }
    end

    def participant_to_inputs_map
      return @participant_to_inputs_map if @participant_to_inputs_map

      output = Hash.new { |hash, key| hash[key] = [] }
      pc = ParticipantsService.new

      @analysis.inputs
        .select(:id, :custom_field_values, :author_id)
        .includes(:author, :taggings).each do |input|
        pc.ideas_participants(Idea.where(id: input)).each do |participant|
          output[participant] << input
        end
      end

      @participant_to_inputs_map = output
    end

    # Method to create a contingency table for two columns
    def contingency_table(data, col1, col2)
      table = Hash.new(0)

      [true, false].product([true, false]) do |v1, v2|
        table[[v1, v2]] = 0
      end

      data.each do |row|
        table[[!!row[col1], !!row[col2]]] += 1
      end

      table
    end

    def chi_square(table)
      # Sum over rows and columns
      row_sums = table.keys.group_by { |k| k[0] }.transform_values { |v| v.sum { |key| table[key] } }
      col_sums = table.keys.group_by { |k| k[1] }.transform_values { |v| v.sum { |key| table[key] } }
      total = table.values.sum

      chi2 = 0.0
      table.each do |(row, col), observed|
        expected = (row_sums[row] * col_sums[col]) / total.to_f

        # chi-square is not reliable if any of the expected frequencies are less
        # than 5 for a 2x2 contingency table
        if row_sums.size == 2 && col_sums.size == 2 && expected < 5
          return [0, 1]
        end

        chi2 += expected > 0 ? ((observed - expected)**2) / expected : 0
      end

      dof = (row_sums.size - 1) * (col_sums.size - 1)
      p_value = 1 - Distribution::ChiSquare.cdf(chi2, dof)
      [chi2, p_value]
    end

    def add_lift!(cells)
      total = cells.sum(&:count)
      row_total = cells.group_by(&:row).transform_values { |v| v.sum(&:count) }
      col_total = cells.group_by(&:column).transform_values { |v| v.sum(&:count) }
      cells.each do |cell|
        cell.lift = if cell.count == 0
          0
        else
          expected = (row_total[cell.row] * col_total[cell.column]) / total.to_f
          cell.count / expected
        end
      end
    end
  end
end
