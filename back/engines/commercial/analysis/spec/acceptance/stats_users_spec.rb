# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

def filter_parameters(s)
  with_options required: false do
    s.parameter :search, 'Filter by searching in title and body'
    s.parameter :'author_custom_<uuid>_from', 'Filter by custom field value of the author for numerical fields, larger than or equal to. Replace <uuid> with the custom_field id'
    s.parameter :'author_custom_<uuid>_to', 'Filter by custom field value of the author for numerical fields, smaller than or equal to. Replace <uuid> with the custom_field id'
    s.parameter :'author_custom_<uuid>', 'Filter by custom field value of the author, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
    s.parameter :'input_custom_<uuid>_from', 'Filter by custom field value of the input for numerical fields, larger than or equal to. Replace <uuid> with the custom_field id'
    s.parameter :'input_custom_<uuid>_to', 'Filter by custom field value of the input for numerical fields, smaller than or equal to. Replace <uuid> with the custom_field id'
    s.parameter :'input_custom_<uuid>', 'Filter by custom field value of the input, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
    s.parameter :published_at_from, 'Filter by input publication date, after or equal to', type: :date
    s.parameter :published_at_to, 'Filter by input publication date, before or equal to', type: :date
    s.parameter :reactions_from, 'Filter by number of reactions on the input, larger than or equal to', type: :integer
    s.parameter :reactions_to, 'Filter by number of reactions on the input, smaller than or equal to', type: :integer
    s.parameter :votes_from, 'Filter by number of votes on the input, larger than or equal to', type: :integer
    s.parameter :votes_to, 'Filter by number of votes on the input, smaller than or equal to', type: :integer
    s.parameter :comments_from, 'Filter by number of comments on the input, larger than or equal to', type: :integer
    s.parameter :comments_to, 'Filter by number of comments on the input, smaller than or equal to', type: :integer
  end
end

resource 'Analysis - Stats - Users' do
  header 'Content-Type', 'application/json'
  let_it_be(:analysis) { create(:analysis) }
  let_it_be(:project) { analysis.project }

  let_it_be(:cf_birthyear) { create(:custom_field_birthyear) }
  let_it_be(:cf_gender) { create(:custom_field_gender, :with_options) }
  let_it_be(:cf_domicile) { create(:custom_field_domicile) }

  let(:analysis_id) { analysis.id }

  before { admin_header_token }

  get 'web_api/v1/analyses/:analysis_id/stats/authors_by_domicile' do
    filter_parameters(self)

    before do
      @area1, @area2, @area3 = create_list(:area, 3)
      # We need to call this to have the somewhere_else option
      Area.recreate_custom_field_options
      @somewhere_else_option = cf_domicile.options.left_joins(:area).find_by(areas: { id: nil })

      authors = [@area1.id, @area1.id, @area2.id, nil, 'outside'].map { |domicile| create(:user, domicile: domicile) }
      create(:idea, project: project, author: authors[0], likes_count: 5)
      create(:idea, project: project, author: authors[0], likes_count: 5)
      create(:idea, project: project, author: authors[1], likes_count: 5)
      create(:idea, project: project, author: authors[2], likes_count: 3)
      create(:idea, project: project, author: authors[3], likes_count: 5)
      create(:idea, project: project, author: authors[4], likes_count: 5)
      create(:idea, author: authors[4], likes_count: 5)
    end

    let(:reactions_from) { 4 }

    example_request 'Authors by domicile' do
      expect(response_status).to eq 200
      expect(json_response_body.dig(:data, :attributes)).to match({
        series: {
          users: {
            @area1.custom_field_option.id => 2,
            @area2.custom_field_option.id => 0,
            @area3.custom_field_option.id => 0,
            @somewhere_else_option.id => 1, # outside
            _blank: 1
          }
        }
      }.deep_symbolize_keys)
    end
  end

  get 'web_api/v1/analyses/:analysis_id/stats/authors_by_age' do
    filter_parameters(self)

    before do
      birthyears = [1962, 1976, 1980, 1990, 1991]
      authors = birthyears.map { |year| create(:user, birthyear: year) }
      author_without_birthyear = create(:user, birthyear: nil)
      create(:idea, project: project, author: authors[0])
      create(:idea, project: project, author: authors[1])
      create(:idea, project: project, author: authors[2])
      create(:idea, project: project, author: authors[3])
      create(:idea, project: project, author: authors[4])
      create(:idea, project: project, author: authors[4], title_multiloc: { en: 'Not p l a n t' })
      create(:idea, project: project, author: author_without_birthyear)
      create(:idea, author: authors[3])
    end

    let(:search) { 'Plant' } # part of the title of the default idea factory

    example 'Authors by age' do
      travel_to(Time.zone.local(2020, 1, 1)) { do_request }
      expect(response_status).to eq 200
      expect(json_response_body.dig(:data, :attributes)).to match(
        unknown_age_count: 1,
        series: {
          user_counts: [0, 0,  2,  1,  1,  1,  0,  0,  0,  0],
          bins:        [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, nil]
        }
      )
    end
  end

  describe 'by_custom_field endpoints' do
    get 'web_api/v1/analyses/:analysis_id/stats/authors_by_custom_field/:custom_field_id' do
      filter_parameters(self)

      describe 'with select field' do
        before do
          @custom_field = create(:custom_field_select)
          @option1, @option2, = create_list(:custom_field_option, 2, custom_field: @custom_field)
          user1 = create(:user, custom_field_values: { @custom_field.key => @option1.key })
          user2 = create(:user, custom_field_values: { @custom_field.key => @option2.key })
          user3 = create(:user)
          create(:idea, project: project, author: user1)
          create(:idea, project: project, author: user2)
          create(:idea, project: project, author: user3)
        end

        let(:custom_field_id) { @custom_field.id }

        example_request 'Authors by custom field (select)' do
          expect(response_status).to eq 200
          expect(json_response_body.dig(:data, :attributes)).to match({
            options: {
              @option1.key => { title_multiloc: @option1.title_multiloc, ordering: 0 },
              @option2.key => { title_multiloc: @option2.title_multiloc, ordering: 1 }
            },
            series: {
              users: {
                @option1.key => 1,
                @option2.key => 1,
                _blank: 1
              }
            }
          }.deep_symbolize_keys)
        end
      end

      describe 'with multiselect field' do
        before do
          @custom_field = create(:custom_field_multiselect)
          @option1, @option2 = create_list(:custom_field_option, 2, custom_field: @custom_field)
          user1 = create(:user, custom_field_values: { @custom_field.key => [@option1.key] })
          user2 = create(:user, custom_field_values: { @custom_field.key => [@option1.key, @option2.key] })
          user3 = create(:user)
          create(:idea, project: project, author: user1)
          create(:idea, project: project, author: user2)
          create(:idea, project: project, author: user3)
        end

        let(:custom_field_id) { @custom_field.id }

        example_request 'Authors by custom field (multiselect)' do
          expect(response_status).to eq 200
          expect(json_response_body.dig(:data, :attributes)).to match({
            options: {
              @option1.key => { title_multiloc: @option1.title_multiloc, ordering: 0 },
              @option2.key => { title_multiloc: @option2.title_multiloc, ordering: 1 }
            },
            series: {
              users: {
                @option1.key => 2,
                @option2.key => 1,
                _blank: 1
              }
            }
          }.deep_symbolize_keys)
        end
      end

      describe 'with checkbox field' do
        before do
          @custom_field = create(:custom_field_checkbox)
          user1 = create(:user)
          user2 = create(:user, custom_field_values: { @custom_field.key => false })
          user3 = create(:user, custom_field_values: { @custom_field.key => true })
          create(:idea, project: project, author: user1)
          create(:idea, project: project, author: user1)
          create(:idea, project: project, author: user2)
          create(:idea, project: project, author: user3)
        end

        let(:custom_field_id) { @custom_field.id }

        example_request 'Authors by custom field (checkbox)' do
          expect(response_status).to eq 200
          expect(json_response_body.dig(:data, :attributes)).to match({
            series: {
              users: {
                # rubocop:disable Lint/BooleanSymbol
                true: 1,
                false: 1,
                _blank: 1
                # rubocop:enable Lint/BooleanSymbol
              }
            }
          })
        end
      end
    end
  end
end
