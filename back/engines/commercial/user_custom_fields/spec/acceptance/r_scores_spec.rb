# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'R-scores (Representativeness scores)' do
  header 'Content-Type', 'application/json'

  get 'web_api/v1/users/custom_fields/:custom_field_id/rscore' do
    parameter :project, <<-DESC, required: false
          Project ID. Only participants of this project will be considered to compute the score.
    DESC

    let(:ref_distribution) { create(:categorical_distribution) }
    let(:custom_field) { ref_distribution.custom_field }
    let(:custom_field_id) { custom_field.id }

    context 'when admin' do
      before do
        admin_header_token
        create_one_user_for_each_option(ref_distribution.custom_field)
      end

      def create_one_user_for_each_option(custom_field)
        custom_field.options.map do |option|
          create(:user, custom_field_values: { custom_field.key => option.key })
        end
      end

      context 'when a reference distribution is associated to the custom field' do
        context 'without filters' do
          example_request 'returns the representativeness score' do
            expect(status).to eq(200)

            expected_counts = custom_field.options.to_h { |option| [option.id.to_sym, 1] }.merge(_blank: 1)
            expect(response_data).to include(
              id: /\A#{ref_distribution.id}_\d+_rscore\z/,
              type: 'rscore',
              attributes: {
                score: be_between(0, 1),
                counts: expected_counts
              },
              relationships: {
                reference_distribution: { data: { id: ref_distribution.id, type: 'categorical_distribution' } }
              }
            )

            expect(json_response_body[:included]).to include(
              hash_including(id: ref_distribution.id, type: 'categorical_distribution')
            )
          end
        end

        context 'with project filter' do
          let(:option) { custom_field.options.first }

          let!(:project) do
            # project with only 1 participant
            participant = User.where(custom_field_values: { custom_field.key => option.key }).first
            create(:idea, author: participant).project_id
          end

          example_request 'returns the representativeness score (filtered by project)' do
            expect(status).to eq(200)

            expected_counts = custom_field
              .options.to_h { |option| [option.id, 0] }
              .merge(option.id => 1, _blank: 0)
              .symbolize_keys

            expect(response_data[:attributes]).to match(
              score: be_between(0, 1),
              counts: expected_counts
            )
          end
        end
      end

      context 'when no reference distribution is associated to the custom field' do
        before { ref_distribution.destroy! }

        example_request 'returns 405 (Method Not Allowed)' do
          expect(status).to eq(405)
        end
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end
end
