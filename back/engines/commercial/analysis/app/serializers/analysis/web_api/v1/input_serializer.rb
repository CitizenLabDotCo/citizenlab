# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class InputSerializer < ::WebApi::V1::BaseSerializer
        set_type :analysis_input

        attributes :title_multiloc, :body_multiloc, :custom_field_values, :published_at, :updated_at, :likes_count, :dislikes_count, :comments_count, :votes_count, :location_description

        attribute(:custom_field_values) do |input, _params|
          idea_files = input.idea_files

          cf_values = input.custom_field_values
          cf_values.each do |k, v|
            next unless v.is_a?(Hash) && v.key?('id')

            idea_file = idea_files.find { |file| file.id == v['id'] }
            cf_values[k][:url] = idea_file.present? ? idea_file.file.url : nil
          end
        end

        belongs_to :author, serializer: ::Analysis::WebApi::V1::AnalysisUserSerializer
        belongs_to :idea, serializer: ::WebApi::V1::IdeaSerializer do |input|
          input
        end
      end
    end
  end
end
