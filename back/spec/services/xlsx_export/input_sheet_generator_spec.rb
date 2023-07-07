# frozen_string_literal: true

require 'rails_helper'

describe XlsxExport::InputSheetGenerator do
  describe '#generate_sheet' do
    let(:include_private_attributes) { false }
    let(:participation_method) { Factory.instance.participation_method_for(participation_context) }
    let(:form) { participation_method.custom_form }
    let(:service) { described_class.new(inputs, form, participation_method, include_private_attributes) }
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
                'Baskets',
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

      context 'without persisted form' do
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
        let!(:baskets) { create_list(:basket, 0, participation_context: participation_context, ideas: [ideation_response1]) }
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
                  'Baskets',
                  'Budget',
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
                    0,
                    ideation_response1.budget,
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
                  'Baskets',
                  'Budget',
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
                    0,
                    ideation_response1.budget,
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
    end

    context 'for a voting context' do
      let(:participation_context) { create(:phase, participation_method: 'ideation') }
    end
  end
end
