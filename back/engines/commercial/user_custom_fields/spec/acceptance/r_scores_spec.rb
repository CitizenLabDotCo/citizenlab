# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Representativeness scores' do
  header 'Content-Type', 'application/json'

  get 'web_api/v1/users/custom_fields/:custom_field_id/representativeness' do
    parameter :project, <<-DESC, required: false
          Project ID. Only participants of this project will be considered to compute the score.
    DESC

    let(:ref_distribution) { create(:ref_distribution) }
    let(:custom_field) { ref_distribution.custom_field }
    let(:custom_field_id) { custom_field.id }

    context 'when admin' do
      before do
        admin_header_token
        create_one_user_for_each_option(ref_distribution.custom_field)
      end

      def create_one_user_for_each_option(custom_field)
        custom_field.custom_field_options.map do |option|
          create(:user, custom_field_values: { custom_field.key => option.key })
        end
      end

      context 'when a reference distribution is associated to the custom field' do
        context 'without filters' do
          example_request 'returns the representativeness score' do
            expect(status).to eq(200)

            expected_counts = custom_field.custom_field_options.to_h { |option| [option.id.to_sym, 1] }.merge(_blank: 1)
            expect(response_data).to include(
              id: /\A#{ref_distribution.id}_\d+_rscore\z/,
              type: 'representativeness_score',
              attributes: {
                score: be_between(0, 1),
                counts: expected_counts
              },
              relationships: {
                reference_distribution: { data: { id: ref_distribution.id, type: 'reference_distribution' } }
              }
            )

            expect(json_response_body[:included]).to include(
              hash_including(id: ref_distribution.id, type: 'reference_distribution')
            )
          end
        end

        context 'with project filter' do
          let(:option) { custom_field.custom_field_options.first }

          let!(:project) do
            # project with only 1 participant
            participant = User.where(custom_field_values: { custom_field.key => option.key }).first
            create(:idea, author: participant).project_id
          end

          example_request 'returns the representativeness score (filtered by project)' do
            expect(status).to eq(200)
            expect(response_data[:attributes]).to match(
              score: be_between(0, 1),
              counts: { option.id.to_sym => 1, _blank: 0 }
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

    context 'when normal user' do
      before { user_header_token }

      example 'returns 401 (Unauthorized)', document: false do
        do_request
        expect(status).to eq(401)
      end
    end

    context 'when visitor' do
      example 'returns 401 (Unauthorized)', document: false do
        do_request
        expect(status).to eq(401)
      end
    end
  end
end
