# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_input_question_answers
#
#  input_id          :uuid
#  question_id       :uuid
#  question_key      :string
#  question_type     :string
#  question_label    :text
#  value_text        :text
#  value_numeric     :decimal(, )
#  value_label       :text
#  question_category :string
#  statement_key     :text
#  statement_label   :text
#  value_geojson     :jsonb
#
module Analytics
  module Reporting
    class InputQuestionAnswer < Analytics::ApplicationRecordView
      self.table_name = 'reporting_input_question_answers'
      self.primary_key = nil

      def self.table_description
        <<~DOC.squish
          One row per answer to a form question of an input: survey answers and
          extra idea-form fields. Multi-select and ranking questions produce one
          row per selected or ranked option, matrix questions one row per
          answered statement. File and shapefile upload answers only record that
          a file is attached, and only while that file still exists, as on the
          survey results page. Point, line and polygon answers carry their
          geometry in value_geojson. Inputs that skipped a question have no row
          for it.
        DOC
      end

      def self.field_descriptions
        {
          'input_id' => 'The input the answer belongs to.',
          'question_id' => 'Id of the form question (custom field). Group on it to aggregate per question.',
          'question_key' => 'Stable machine key of the question within its form.',
          'question_type' => <<~DOC.squish,
            Answer format: 'select', 'select_image', 'multiselect',
            'multiselect_image', 'ranking', 'checkbox', 'text', 'multiline_text',
            'date', 'number', 'linear_scale', 'rating', 'sentiment_linear_scale',
            'matrix_linear_scale', 'file_upload', 'shapefile_upload', 'point',
            'line' or 'polygon'.
          DOC
          'question_label' => 'Question text, resolved to the platform primary locale.',
          'value_text' => <<~DOC.squish,
            Textual answer: the option key for (multi)select and ranking
            questions, free text for text questions, 'true'/'false' for
            checkboxes. NULL for numeric, matrix, file upload and mapping
            questions.
            Option keys are stable ids, not what participants saw: report
            value_label instead.
          DOC
          'value_numeric' => <<~DOC.squish,
            Numeric answer for 'number', 'linear_scale', 'rating',
            'sentiment_linear_scale' and 'matrix_linear_scale' questions (scales
            run from 1 upwards). Aggregate with AVG for scores. If admins
            shortened a 'linear_scale', 'rating' or 'sentiment_linear_scale'
            question after people answered, older answers can be above the
            current top point. They are kept, so AVG matches the averages the
            platform shows, but the platform's per-point counts leave them out:
            mention such points rather than drop them silently. For 'ranking'
            questions, the rank the participant gave the option (1 = ranked
            first): AVG per option gives its average rank, lower is better. NULL
            for other question types.
          DOC
          'value_label' => <<~DOC.squish,
            The answer as participants saw it, resolved to the platform primary
            locale: the option title for (multi)select and ranking questions,
            the label of the chosen point for 'linear_scale',
            'sentiment_linear_scale' and 'matrix_linear_scale' questions (often
            only the end points have one). NULL when there is no label. Always
            use it rather than the option key in reports: keys are fixed when an
            option is created, so they can contradict a label that was edited
            later.
          DOC
          'question_category' => <<~DOC.squish,
            Theme of a community monitor question: 'quality_of_life',
            'service_delivery', 'governance_and_trust' or 'other'. NULL for
            questions outside the community monitor survey.
          DOC
          'statement_key' => <<~DOC.squish,
            For 'matrix_linear_scale' questions, the stable key of the statement
            this row answers. Group on question_id and statement_key to
            aggregate per statement. NULL for other question types.
          DOC
          'statement_label' => <<~DOC.squish,
            For 'matrix_linear_scale' questions, the statement text, resolved to
            the platform primary locale. Report it rather than statement_key.
            NULL for other question types.
          DOC
          'value_geojson' => <<~DOC.squish
            For 'point', 'line' and 'polygon' questions, the drawn shape as a
            GeoJSON geometry object (type 'Point', 'LineString' or 'Polygon').
            Coordinates are [longitude, latitude] pairs in WGS 84, longitude
            first: for a point, value_geojson -> 'coordinates' ->> 0 is the
            longitude and ->> 1 the latitude. NULL for other question types,
            including 'shapefile_upload', whose shapes stay in the uploaded file.
          DOC
        }
      end

      def self.foreign_keys
        { 'input_id' => 'reporting_inputs.id' }
      end
    end
  end
end
