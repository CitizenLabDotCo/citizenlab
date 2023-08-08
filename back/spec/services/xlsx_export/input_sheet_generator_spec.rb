# frozen_string_literal: true

require 'rails_helper'

describe XlsxExport::InputSheetGenerator do
  describe '#generate_sheet' do
    before { create(:idea_status_proposed) }

    let(:include_private_attributes) { false }
    let(:service) { described_class.new(inputs, participation_context, include_private_attributes) }
    let(:sheetname) { 'My sheet' }
    let(:xlsx) do
      package = Axlsx::Package.new
      service.generate_sheet package.workbook, sheetname
      xlsx_contents package.to_stream
    end

    context 'for an ideation context' do
      let(:participation_context) { create(:phase, participation_method: 'ideation') }

      describe 'when there are no inputs' do
        let(:inputs) { [] }

        it 'Generates an empty sheet' do
          expect(xlsx).to eq([
            {
              sheet_name: 'My sheet',
              column_headers: [
                'ID',
                'Title',
                'Description',
                'Attachments',
                'Tags',
                'Latitude',
                'Longitude',
                'Location',
                'Proposed Budget',
                'Submitted at',
                'Published at',
                'Comments',
                'Likes',
                'Dislikes',
                'URL',
                'Project',
                'Status'
              ],
              rows: []
            }
          ])
        end
      end

      context 'without persisted form' do
        let(:assignee) { create(:admin, first_name: 'John', last_name: 'Doe') }
        let(:ideation_response1) do
          create(
            :idea_with_topics,
            project: participation_context.project,
            phases: [participation_context],
            author: create(:user, custom_field_values: { create(:custom_field_birthyear).code => 1999 }),
            assignee: assignee
          )
        end
        let!(:attachment1) { create(:idea_file, idea: ideation_response1) }
        let!(:comments) { create_list(:comment, 1, post: ideation_response1) }
        let!(:likes) { create_list(:reaction, 2, reactable: ideation_response1) }
        let!(:dislikes) { create_list(:dislike, 1, reactable: ideation_response1) }
        let(:inputs) { [ideation_response1.reload] }

        it 'Generates an sheet with the phase inputs' do
          expect(xlsx).to match([
            {
              sheet_name: 'My sheet',
              column_headers: [
                'ID',
                'Title',
                'Description',
                'Attachments',
                'Tags',
                'Latitude',
                'Longitude',
                'Location',
                'Proposed Budget',
                'Submitted at',
                'Published at',
                'Comments',
                'Likes',
                'Dislikes',
                'URL',
                'Project',
                'Status',
                'birthyear'
              ],
              rows: [
                [
                  ideation_response1.id,
                  ideation_response1.title_multiloc['en'],
                  'It would improve the air quality!', # html tags are removed
                  %r{\A/uploads/.+/idea_file/file/#{attachment1.id}/#{attachment1.name}\Z},
                  "#{ideation_response1.topics[0].title_multiloc['en']}, #{ideation_response1.topics[1].title_multiloc['en']}",
                  ideation_response1.location_point.coordinates.last,
                  ideation_response1.location_point.coordinates.first,
                  ideation_response1.location_description,
                  ideation_response1.proposed_budget,
                  an_instance_of(DateTime), # created_at
                  an_instance_of(DateTime), # published_at
                  1,
                  2,
                  1,
                  "http://example.org/ideas/#{ideation_response1.slug}",
                  participation_context.project.title_multiloc['en'],
                  ideation_response1.idea_status.title_multiloc['en'],
                  1999
                ]
              ]
            }
          ])
        end
      end

      context 'with persisted form' do
        let(:project_form) { create(:custom_form, :with_default_fields, participation_context: participation_context.project) }
        let!(:extra_idea_field) do
          create(
            :custom_field_extra_custom_form,
            resource: project_form
          )
        end
        let(:assignee) { create(:admin, first_name: 'John', last_name: 'Doe') }
        let(:ideation_response1) do
          create(
            :idea_with_topics,
            project: participation_context.project,
            phases: [participation_context],
            custom_field_values: { extra_idea_field.key => 'Answer' },
            assignee: assignee
          )
        end
        let!(:attachment1) { create(:idea_file, idea: ideation_response1) }
        let!(:attachment2) do
          create(
            :idea_file,
            idea: ideation_response1,
            file: Rails.root.join('spec/fixtures/david.csv').open,
            name: 'david.csv'
          )
        end
        let!(:comments) { create_list(:comment, 1, post: ideation_response1) }
        let!(:likes) { create_list(:reaction, 2, reactable: ideation_response1) }
        let!(:dislikes) { create_list(:dislike, 1, reactable: ideation_response1) }
        let(:inputs) { [ideation_response1.reload] }

        context 'without private attributes' do
          let(:include_private_attributes) { false }

          it 'Generates an sheet with the phase inputs' do
            expect(xlsx).to match([
              {
                sheet_name: 'My sheet',
                column_headers: [
                  'ID',
                  'Title',
                  'Description',
                  'Attachments',
                  'Tags',
                  'Latitude',
                  'Longitude',
                  'Location',
                  'Proposed Budget',
                  extra_idea_field.title_multiloc['en'],
                  'Submitted at',
                  'Published at',
                  'Comments',
                  'Likes',
                  'Dislikes',
                  'URL',
                  'Project',
                  'Status'
                ],
                rows: [
                  [
                    ideation_response1.id,
                    ideation_response1.title_multiloc['en'],
                    'It would improve the air quality!', # html tags are removed
                    %r{\A/uploads/.+/idea_file/file/#{attachment1.id}/#{attachment1.name}\n/uploads/.+/idea_file/file/#{attachment2.id}/#{attachment2.name}\Z},
                    "#{ideation_response1.topics[0].title_multiloc['en']}, #{ideation_response1.topics[1].title_multiloc['en']}",
                    ideation_response1.location_point.coordinates.last,
                    ideation_response1.location_point.coordinates.first,
                    ideation_response1.location_description,
                    ideation_response1.proposed_budget,
                    'Answer',
                    an_instance_of(DateTime), # created_at
                    an_instance_of(DateTime), # published_at
                    1,
                    2,
                    1,
                    "http://example.org/ideas/#{ideation_response1.slug}",
                    participation_context.project.title_multiloc['en'],
                    ideation_response1.idea_status.title_multiloc['en']
                  ]
                ]
              }
            ])
          end
        end

        context 'with private attributes' do
          let(:include_private_attributes) { true }

          it 'Generates an sheet with the phase inputs' do
            expect(xlsx).to match([
              {
                sheet_name: 'My sheet',
                column_headers: [
                  'ID',
                  'Title',
                  'Description',
                  'Attachments',
                  'Tags',
                  'Latitude',
                  'Longitude',
                  'Location',
                  'Proposed Budget',
                  extra_idea_field.title_multiloc['en'],
                  'Author name',
                  'Author email',
                  'Author ID',
                  'Submitted at',
                  'Published at',
                  'Comments',
                  'Likes',
                  'Dislikes',
                  'URL',
                  'Project',
                  'Status',
                  'Assignee',
                  'Assignee email'
                ],
                rows: [
                  [
                    ideation_response1.id,
                    ideation_response1.title_multiloc['en'],
                    'It would improve the air quality!', # html tags are removed
                    %r{\A/uploads/.+/idea_file/file/#{attachment1.id}/#{attachment1.name}\n/uploads/.+/idea_file/file/#{attachment2.id}/#{attachment2.name}\Z},
                    "#{ideation_response1.topics[0].title_multiloc['en']}, #{ideation_response1.topics[1].title_multiloc['en']}",
                    ideation_response1.location_point.coordinates.last,
                    ideation_response1.location_point.coordinates.first,
                    ideation_response1.location_description,
                    ideation_response1.proposed_budget,
                    'Answer',
                    ideation_response1.author_name,
                    ideation_response1.author.email,
                    ideation_response1.author_id,
                    an_instance_of(DateTime), # created_at
                    an_instance_of(DateTime), # published_at
                    1,
                    2,
                    1,
                    "http://example.org/ideas/#{ideation_response1.slug}",
                    participation_context.project.title_multiloc['en'],
                    ideation_response1.idea_status.title_multiloc['en'],
                    "#{assignee.first_name} #{assignee.last_name}",
                    assignee.email
                  ]
                ]
              }
            ])
          end
        end
      end
    end

    context 'for a native survey context' do
      let(:participation_context) { create(:native_survey_phase) }
      let(:form) { create(:custom_form, participation_context: participation_context) }

      # Create a page to describe that it is not included in the export.
      let!(:page_field) { create(:custom_field_page, resource: form) }
      let!(:multiselect_field) do
        create(
          :custom_field_multiselect,
          resource: form,
          title_multiloc: { 'en' => 'What are your favourite pets?' },
          description_multiloc: {}
        )
      end
      let!(:cat_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'cat', title_multiloc: { 'en' => 'Cat' })
      end
      let!(:dog_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'dog', title_multiloc: { 'en' => 'Dog' })
      end

      let(:survey_response1) do
        create(
          :idea,
          project: participation_context.project,
          creation_phase: participation_context,
          phases: [participation_context],
          custom_field_values: { multiselect_field.key => %w[cat dog] }
        )
      end
      let(:survey_response2) do
        create(
          :idea,
          project: participation_context.project,
          creation_phase: participation_context,
          phases: [participation_context],
          custom_field_values: { multiselect_field.key => %w[cat] }
        )
      end
      let(:survey_response3) do
        create(
          :idea,
          project: participation_context.project,
          creation_phase: participation_context,
          phases: [participation_context],
          custom_field_values: { multiselect_field.key => %w[dog] },
          author: nil
        )
      end
      let(:inputs) { [survey_response1, survey_response2, survey_response3] }

      describe 'when there are no inputs' do
        let(:inputs) { [] }

        it 'Generates an empty sheet' do
          expect(xlsx).to eq([
            {
              sheet_name: 'My sheet',
              column_headers: [
                'ID',
                'What are your favourite pets?',
                'Submitted at',
                'Project'
              ],
              rows: []
            }
          ])
        end
      end

      context 'without private attributes' do
        let(:include_private_attributes) { false }

        it 'Generates an sheet with the phase inputs' do
          expect(xlsx).to match([
            {
              sheet_name: 'My sheet',
              column_headers: [
                'ID',
                'What are your favourite pets?',
                'Submitted at',
                'Project'
              ],
              rows: [
                [
                  survey_response1.id,
                  'Cat, Dog',
                  an_instance_of(DateTime), # created_at
                  participation_context.project.title_multiloc['en']
                ],
                [
                  survey_response2.id,
                  'Cat',
                  an_instance_of(DateTime), # created_at
                  participation_context.project.title_multiloc['en']
                ],
                [
                  survey_response3.id,
                  'Dog',
                  an_instance_of(DateTime), # created_at
                  participation_context.project.title_multiloc['en']
                ]
              ]
            }
          ])
        end
      end

      context 'with private attributes' do
        let(:include_private_attributes) { true }

        it 'Generates an sheet with the phase inputs' do
          expect(xlsx).to match([
            {
              sheet_name: 'My sheet',
              column_headers: [
                'ID',
                'What are your favourite pets?',
                'Author name',
                'Author email',
                'Author ID',
                'Submitted at',
                'Project'
              ],
              rows: [
                [
                  survey_response1.id,
                  'Cat, Dog',
                  survey_response1.author_name,
                  survey_response1.author.email,
                  survey_response1.author_id,
                  an_instance_of(DateTime), # created_at
                  participation_context.project.title_multiloc['en']
                ],
                [
                  survey_response2.id,
                  'Cat',
                  survey_response2.author_name,
                  survey_response2.author.email,
                  survey_response2.author_id,
                  an_instance_of(DateTime), # created_at
                  participation_context.project.title_multiloc['en']
                ],
                [
                  survey_response3.id,
                  'Dog',
                  nil,
                  nil,
                  nil,
                  an_instance_of(DateTime), # created_at
                  participation_context.project.title_multiloc['en']
                ]
              ]
            }
          ])
        end
      end
    end

    context 'for a voting context' do
      let(:participation_context) { create(:voting_phase) }

      describe 'when there are no inputs' do
        let(:inputs) { [] }

        context 'voting method is single voting' do
          it 'Generates an empty sheet with the correct columns' do
            expect(xlsx).to eq([
              {
                sheet_name: 'My sheet',
                column_headers: [
                  'ID',
                  'Title',
                  'Description',
                  'Attachments',
                  'Tags',
                  'Latitude',
                  'Longitude',
                  'Location',
                  'Proposed Budget',
                  'Submitted at',
                  'Published at',
                  'Comments',
                  'Votes',
                  'URL',
                  'Project',
                  'Status'
                ],
                rows: []
              }
            ])
          end
        end

        context 'voting method is multiple voting' do
          let(:participation_context) { create(:voting_phase, voting_method: 'multiple_voting') }

          it 'Generates an empty sheet with the correct columns' do
            expect(xlsx).to eq([
              {
                sheet_name: 'My sheet',
                column_headers: [
                  'ID',
                  'Title',
                  'Description',
                  'Attachments',
                  'Tags',
                  'Latitude',
                  'Longitude',
                  'Location',
                  'Proposed Budget',
                  'Submitted at',
                  'Published at',
                  'Comments',
                  'Participants',
                  'Votes',
                  'URL',
                  'Project',
                  'Status'
                ],
                rows: []
              }
            ])
          end
        end

        context 'voting method is budgeting' do
          let(:participation_context) { create(:voting_phase, voting_method: 'budgeting') }

          it 'Generates an empty sheet with the correct columns' do
            expect(xlsx).to eq([
              {
                sheet_name: 'My sheet',
                column_headers: [
                  'ID',
                  'Title',
                  'Description',
                  'Attachments',
                  'Tags',
                  'Latitude',
                  'Longitude',
                  'Location',
                  'Proposed Budget',
                  'Submitted at',
                  'Published at',
                  'Comments',
                  'Picks',
                  'Budget',
                  'URL',
                  'Project',
                  'Status'
                ],
                rows: []
              }
            ])
          end
        end
      end

      context 'without persisted form' do
        let(:assignee) { create(:admin, first_name: 'John', last_name: 'Doe') }
        let(:ideation_response1) do
          create(
            :idea_with_topics,
            project: participation_context.project,
            phases: [participation_context],
            author: create(:user, custom_field_values: { create(:custom_field_birthyear).code => 1999 }),
            assignee: assignee
          )
        end
        let!(:attachment1) { create(:idea_file, idea: ideation_response1) }
        let!(:comments) { create_list(:comment, 1, post: ideation_response1) }
        let!(:likes) { create_list(:reaction, 1, reactable: ideation_response1) }
        let!(:baskets) do
          create_list(:basket, 2, participation_context: participation_context, ideas: [ideation_response1]).each(&:update_counts!)
        end
        let(:inputs) { [ideation_response1.reload] }

        it 'Generates an sheet with the phase inputs' do
          expect(xlsx).to match([
            {
              sheet_name: 'My sheet',
              column_headers: [
                'ID',
                'Title',
                'Description',
                'Attachments',
                'Tags',
                'Latitude',
                'Longitude',
                'Location',
                'Proposed Budget',
                'Submitted at',
                'Published at',
                'Comments',
                'Votes',
                'URL',
                'Project',
                'Status',
                'birthyear'
              ],
              rows: [
                [
                  ideation_response1.id,
                  ideation_response1.title_multiloc['en'],
                  'It would improve the air quality!', # html tags are removed
                  %r{\A/uploads/.+/idea_file/file/#{attachment1.id}/#{attachment1.name}\Z},
                  "#{ideation_response1.topics[0].title_multiloc['en']}, #{ideation_response1.topics[1].title_multiloc['en']}",
                  ideation_response1.location_point.coordinates.last,
                  ideation_response1.location_point.coordinates.first,
                  ideation_response1.location_description,
                  ideation_response1.proposed_budget,
                  an_instance_of(DateTime), # created_at
                  an_instance_of(DateTime), # published_at
                  1,
                  2,
                  "http://example.org/ideas/#{ideation_response1.slug}",
                  participation_context.project.title_multiloc['en'],
                  ideation_response1.idea_status.title_multiloc['en'],
                  1999
                ]
              ]
            }
          ])
        end
      end

      context 'with persisted form' do
        let(:project_form) { create(:custom_form, :with_default_fields, participation_context: participation_context.project) }
        let!(:extra_idea_field) do
          create(
            :custom_field_extra_custom_form,
            resource: project_form
          )
        end
        let(:assignee) { create(:admin, first_name: 'John', last_name: 'Doe') }
        let(:ideation_response1) do
          create(
            :idea_with_topics,
            project: participation_context.project,
            phases: [participation_context],
            custom_field_values: { extra_idea_field.key => 'Answer' },
            assignee: assignee
          )
        end
        let!(:attachment1) { create(:idea_file, idea: ideation_response1) }
        let!(:attachment2) do
          create(
            :idea_file,
            idea: ideation_response1,
            file: Rails.root.join('spec/fixtures/david.csv').open,
            name: 'david.csv'
          )
        end
        let!(:comments) { create_list(:comment, 1, post: ideation_response1) }
        let!(:likes) { create_list(:reaction, 2, reactable: ideation_response1) }
        let!(:baskets) do
          create_list(:basket, 2, participation_context: participation_context, ideas: [ideation_response1]).each do |basket|
            basket.baskets_ideas.first.update!(votes: 2)
            basket.update_counts!
          end
        end
        let!(:other_phase) { create(:voting_phase, project: participation_context.project, start_at: (Time.now - 6.months), end_at: (Time.now - 4.months)) }
        let!(:other_basket) { create(:basket, participation_context: other_phase, ideas: [ideation_response1]) }
        let(:inputs) { [ideation_response1.reload] }

        context 'without private attributes' do
          let(:include_private_attributes) { false }

          it 'Generates an sheet with the phase inputs' do
            expect(xlsx).to match([
              {
                sheet_name: 'My sheet',
                column_headers: [
                  'ID',
                  'Title',
                  'Description',
                  'Attachments',
                  'Tags',
                  'Latitude',
                  'Longitude',
                  'Location',
                  'Proposed Budget',
                  extra_idea_field.title_multiloc['en'],
                  'Submitted at',
                  'Published at',
                  'Comments',
                  'Votes',
                  'URL',
                  'Project',
                  'Status'
                ],
                rows: [
                  [
                    ideation_response1.id,
                    ideation_response1.title_multiloc['en'],
                    'It would improve the air quality!', # html tags are removed
                    %r{\A/uploads/.+/idea_file/file/#{attachment1.id}/#{attachment1.name}\n/uploads/.+/idea_file/file/#{attachment2.id}/#{attachment2.name}\Z},
                    "#{ideation_response1.topics[0].title_multiloc['en']}, #{ideation_response1.topics[1].title_multiloc['en']}",
                    ideation_response1.location_point.coordinates.last,
                    ideation_response1.location_point.coordinates.first,
                    ideation_response1.location_description,
                    ideation_response1.proposed_budget,
                    'Answer',
                    an_instance_of(DateTime), # created_at
                    an_instance_of(DateTime), # published_at
                    1,
                    4,
                    "http://example.org/ideas/#{ideation_response1.slug}",
                    participation_context.project.title_multiloc['en'],
                    ideation_response1.idea_status.title_multiloc['en']
                  ]
                ]
              }
            ])
          end
        end

        context 'with private attributes' do
          let(:include_private_attributes) { true }

          it 'Generates an sheet with the phase inputs' do
            expect(xlsx).to match([
              {
                sheet_name: 'My sheet',
                column_headers: [
                  'ID',
                  'Title',
                  'Description',
                  'Attachments',
                  'Tags',
                  'Latitude',
                  'Longitude',
                  'Location',
                  'Proposed Budget',
                  extra_idea_field.title_multiloc['en'],
                  'Author name',
                  'Author email',
                  'Author ID',
                  'Submitted at',
                  'Published at',
                  'Comments',
                  'Votes',
                  'URL',
                  'Project',
                  'Status',
                  'Assignee',
                  'Assignee email'
                ],
                rows: [
                  [
                    ideation_response1.id,
                    ideation_response1.title_multiloc['en'],
                    'It would improve the air quality!', # html tags are removed
                    %r{\A/uploads/.+/idea_file/file/#{attachment1.id}/#{attachment1.name}\n/uploads/.+/idea_file/file/#{attachment2.id}/#{attachment2.name}\Z},
                    "#{ideation_response1.topics[0].title_multiloc['en']}, #{ideation_response1.topics[1].title_multiloc['en']}",
                    ideation_response1.location_point.coordinates.last,
                    ideation_response1.location_point.coordinates.first,
                    ideation_response1.location_description,
                    ideation_response1.proposed_budget,
                    'Answer',
                    ideation_response1.author_name,
                    ideation_response1.author.email,
                    ideation_response1.author_id,
                    an_instance_of(DateTime), # created_at
                    an_instance_of(DateTime), # published_at
                    1,
                    4,
                    "http://example.org/ideas/#{ideation_response1.slug}",
                    participation_context.project.title_multiloc['en'],
                    ideation_response1.idea_status.title_multiloc['en'],
                    "#{assignee.first_name} #{assignee.last_name}",
                    assignee.email
                  ]
                ]
              }
            ])
          end
        end
      end
    end
  end
end
