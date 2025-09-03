# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'R-scores (Representativeness scores)' do
  header 'Content-Type', 'application/json'

  get 'web_api/v1/users/custom_fields/:custom_field_id/rscore' do
    parameter :project, <<-DESC, required: false
          Project ID. Only participants of this project will be considered to compute the score.
    DESC

    # `custom_field_id` is overridden in the `when admin` context below.
    # For the other (non-authorized) users, it's value does not matter and the custom
    # field may not even exist.
    let(:custom_field_id) { 'whatever' }

    context 'when admin' do
      before { admin_header_token }

      context 'when reference data is available' do
        let(:custom_field) { ref_distribution.custom_field }
        let(:custom_field_id) { custom_field.id }

        let(:response_structure) do
          {
            data: {
              id: /\A#{ref_distribution.id}_\d+_rscore\z/,
              type: 'rscore',
              attributes: {
                score: be_between(0, 1).or(be_nil),
                counts: be_an(Hash).or(be_an(Array))
              },
              relationships: {
                reference_distribution: {
                  data: {
                    id: ref_distribution.id,
                    type: Utils.snakecase(ref_distribution.type.demodulize)
                  }
                }
              }
            },
            included: [hash_including(
              id: ref_distribution.id,
              type: Utils.snakecase(ref_distribution.type.demodulize)
            )]
          }
        end

        context 'for select custom field' do
          let(:ref_distribution) { create(:categorical_distribution) }

          before do
            create_one_user_for_each_option(custom_field)
          end

          def create_one_user_for_each_option(custom_field)
            custom_field.options.map do |option|
              create(:user, custom_field_values: { custom_field.key => option.key })
            end
          end

          example_request 'returns the R-score' do
            expect(status).to eq(200)
            expect(json_response_body).to match(response_structure)
            expected_counts = custom_field.options.to_h { |option| [option.id.to_sym, 1] }.merge(_blank: 1)
            expect(response_data.dig(:attributes, :counts)).to match(expected_counts)
          end

          context 'with project filter' do
            let(:option) { custom_field.options.first }
            let!(:project) do
              # project with only 1 participant
              participant = User.where(custom_field_values: { custom_field.key => option.key }).first
              create(:idea, author: participant).project_id
            end

            example_request 'returns the R-score (filtered by project)' do
              expect(status).to eq(200)
              expect(json_response_body).to match(response_structure)
              expected_counts = custom_field
                .options.to_h { |option| [option.id, 0] }
                .merge(option.id => 1, _blank: 0)
                .symbolize_keys
              expect(response_data.dig(:attributes, :counts)).to match(expected_counts)
            end
          end
        end

        context 'for birthyear custom field' do
          let!(:ref_distribution) { create(:binned_distribution, bins: [18, 35, 75, nil]) }

          before do
            birthyears = [1970, 1980, 1990, 2000]
            _users = birthyears.map { |year| create(:user, birthyear: year) }
          end

          example 'returns the R-score' do
            travel_to(Time.zone.local(2010)) { do_request }

            expect(status).to eq(200)
            expect(json_response_body).to match(response_structure)
            # There are 5 users in total: 4 with year of birth and 1 without (the user
            # that performs the request). Users without birth year are not taken into
            # account. The user born in 2020 is also not taken into account because they
            # are too young (wrt the age bins).
            expect(response_data.dig(:attributes, :counts)).to eq [2, 1, 0]
          end
        end
      end

      context 'when custom field has no reference data' do
        let(:custom_field_id) { create(:custom_field_select).id }

        example_request 'returns 405 (Method Not Allowed)' do
          expect(status).to eq(405)
        end
      end
    end

    include_examples 'not authorized to visitors'
    include_examples 'not authorized to normal users'
  end
end
