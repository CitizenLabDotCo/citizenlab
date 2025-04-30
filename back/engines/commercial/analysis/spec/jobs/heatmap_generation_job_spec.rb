# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::HeatmapGenerationJob do
  before do
    SettingsService.new.activate_feature!('auto_insights')
    Analytics::PopulateDimensionsService.populate_types
  end

  describe '.perform_now' do
    let(:project) { create(:single_phase_ideation_project) }
    let(:analysis) { create(:analysis, project: project) }
    let(:tags) { create_list(:tag, 2, analysis: analysis) }
    let(:users) do
      create_list(:user, 10) +
        create_list(:user, 10) +
        create_list(:user, 10)
    end
    let!(:inputs) do
      users[0...10].map do |user|
        create(:idea, project: project, author: user)
      end
    end

    let!(:custom_field) { create(:custom_field_select, :with_options) }

    # Create likes
    let!(:likes) do
      users[10...20].map do |user|
        create(:reaction, reactable: inputs.sample, user: user)
      end
    end

    # Create dislikes
    let!(:dislikes) do
      users[20...30].map do |user|
        create(:reaction, reactable: inputs.sample, user: user, mode: 'down')
      end
    end

    # Add tagging to first input
    let!(:tagging) { create(:tagging, tag: tags[0], input: inputs[0]) }

    it 'generates the heatmap for all units' do
      expect { described_class.perform_now(analysis.reload) }
        .to change { analysis.heatmap_cells.count }.by(16)

      expect(Analysis::HeatmapCell.all.pluck(:unit).uniq)
        .to match_array(%w[inputs likes dislikes participants])

      expect do
        described_class.perform_now(analysis.reload)
      end.to have_enqueued_job(LogActivityJob).with(
        analysis,
        'heatmap_generated',
        nil,
        anything,
        hash_including(
          payload: hash_including(
            inputs_count: 10,
            participants_count: 30,
            newest_input_at: inputs.last.created_at.to_i,
            additional_custom_field_ids: [],
            tags_count: 2
          ),
          project_id: project.id
        )
      )
    end
  end

  describe 'perform when there is a change in the additional custom fields' do
    let(:project) { create(:single_phase_ideation_project) }
    let(:main_field) { create(:custom_field_text) }
    let(:additional_field) { create(:custom_field_checkbox) }
    let(:analysis) { create(:analysis, project: project, main_custom_field: main_field, additional_custom_fields: [additional_field]) }
    let(:users) do
      create_list(:user, 10) +
        create_list(:user, 10) +
        create_list(:user, 10)
    end
    let!(:inputs) do
      users[0...30].map do |user|
        create(:idea, project: project, author: user)
      end
    end

    it 'enqueues a log activity job with the additional custom field ids' do
      expect do
        described_class.perform_now(analysis)
      end
        .to have_enqueued_job(LogActivityJob).with(
          analysis,
          'heatmap_generated',
          nil,
          anything,
          hash_including(
            payload: hash_including(
              inputs_count: 30,
              participants_count: 30,
              newest_input_at: inputs.last.created_at.to_i,
              additional_custom_field_ids: [additional_field.id],
              tags_count: 0
            ),
            project_id: analysis.source_project.id
          )
        )
    end

    it 'enqueues a log activity job when additional custom fields are removed' do
      # Create initial activity
      create(:activity, item: analysis, action: 'heatmap_generated', payload: {
        inputs_count: 30,
        participants_count: 30,
        newest_input_at: inputs.last.created_at.to_i,
        additional_custom_field_ids: [additional_field.id],
        tags_count: 0
      })

      # Update analysis to have empty additional custom fields
      analysis.update!(additional_custom_fields: [])

      expect do
        described_class.perform_now(analysis)
      end.to have_enqueued_job(LogActivityJob).with(
        analysis,
        'heatmap_generated',
        nil,
        anything,
        hash_including(
          payload: hash_including(
            inputs_count: 30,
            participants_count: 30,
            newest_input_at: inputs.last.created_at.to_i,
            additional_custom_field_ids: [],
            tags_count: 0
          ),
          project_id: analysis.source_project.id
        )
      )
    end

    it 'enqueues a log activity job when additional custom fields are added' do
      # Create initial activity
      create(:activity, item: analysis, action: 'heatmap_generated', payload: {
        inputs_count: 30,
        participants_count: 30,
        newest_input_at: inputs.last.created_at.to_i,
        additional_custom_field_ids: [],
        tags_count: 0
      })

      # Update analysis to have new additional custom fields
      new_additional_field = create(:custom_field_checkbox)
      analysis.update!(additional_custom_fields: [new_additional_field])

      expect do
        described_class.perform_now(analysis)
      end.to have_enqueued_job(LogActivityJob).with(
        analysis,
        'heatmap_generated',
        nil,
        anything,
        hash_including(
          payload: hash_including(
            inputs_count: 30,
            participants_count: 30,
            newest_input_at: inputs.last.created_at.to_i,
            additional_custom_field_ids: [new_additional_field.id],
            tags_count: 0
          ),
          project_id: analysis.source_project.id
        )
      )
    end
  end

  describe 'do not perform if there are not enough participants' do
    let(:project) { create(:single_phase_ideation_project) }
    let(:analysis) { create(:analysis, project: project) }
    let(:tags) { create_list(:tag, 2, analysis: analysis) }
    let(:users) { create_list(:user, 10) }
    let!(:inputs) do
      users[0...10].map do |user|
        create(:idea, project: project, author: user)
      end
    end

    let!(:custom_field) { create(:custom_field_select, :with_options) }
    let!(:tagging) { create(:tagging, tag: tags[0], input: inputs[0]) }

    it 'does not generate the heatmap' do
      expect { described_class.perform_now(analysis.reload) }
        .not_to change { analysis.heatmap_cells.count }
    end
  end

  describe 'do not perform if the feature is not activated' do
    let(:project) { create(:single_phase_ideation_project) }
    let(:analysis) { create(:analysis, project: project) }
    let(:tags) { create_list(:tag, 2, analysis: analysis) }
    let(:users) do
      create_list(:user, 10) +
        create_list(:user, 10) +
        create_list(:user, 10)
    end
    let!(:inputs) do
      users[0...10].map do |user|
        create(:idea, project: project, author: user)
      end
    end

    let!(:auto_insights_deactivated) { SettingsService.new.deactivate_feature!('auto_insights') }
    let!(:custom_field) { create(:custom_field_select, :with_options) }

    # Create likes
    let!(:likes) do
      users[10...20].map do |user|
        create(:reaction, reactable: inputs.sample, user: user)
      end
    end

    # Create dislikes
    let!(:dislikes) do
      users[20...30].map do |user|
        create(:reaction, reactable: inputs.sample, user: user, mode: 'down')
      end
    end

    # Add tagging to first input
    let!(:tagging) { create(:tagging, tag: tags[0], input: inputs[0]) }

    it 'does not generate the heatmap' do
      expect { described_class.perform_now(analysis.reload) }
        .not_to change { analysis.heatmap_cells.count }
    end
  end

  describe 'do not perform if there is already a logged activity and there has been no change in the input count, participants count or the date of the latest input' do
    let(:project) { create(:single_phase_ideation_project) }
    let(:analysis) { create(:analysis, project: project) }
    let(:tags) { create_list(:tag, 2, analysis: analysis) }
    let(:users) do
      create_list(:user, 10) +
        create_list(:user, 10) +
        create_list(:user, 10)
    end
    let!(:inputs) do
      users[0...10].map do |user|
        create(:idea, project: project, author: user)
      end
    end

    let!(:custom_field) { create(:custom_field_select, :with_options) }

    # Create likes
    let!(:likes) do
      users[10...20].map do |user|
        create(:reaction, reactable: inputs.sample, user: user)
      end
    end

    # Create dislikes
    let!(:dislikes) do
      users[20...30].map do |user|
        create(:reaction, reactable: inputs.sample, user: user, mode: 'down')
      end
    end

    # Add tagging to first input
    let!(:tagging) { create(:tagging, tag: tags[0], input: inputs[0]) }

    # Create activity for the analysis
    let!(:activity) { create(:activity, item: analysis, action: 'heatmap_generated', payload: { inputs_count: 10, participants_count: 30, newest_input_at: inputs.last.created_at.to_i, additional_custom_field_ids: [], tags_count: 2 }) }

    it 'does not generate the heatmap' do
      expect { described_class.perform_now(analysis.reload) }
        .not_to change { analysis.heatmap_cells.count }
    end
  end
end
