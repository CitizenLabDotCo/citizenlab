# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactProjectStatus, type: :model do
  subject { described_class.new }

  let(:user) { create(:user) }

  it { is_expected.to belong_to(:dimension_project) }
  it { is_expected.to belong_to(:dimension_date) }

  shared_examples 'project can have status' do |status|
    it "the project can have the #{status} status", :aggregate_failures do
      LogActivityJob.perform_now(project, status, user, project.updated_at.to_i)

      expect(described_class.count).to be <= 2 # can also have the 'finished' status

      project_status = described_class.find_by(status: status)
      expect(project_status.timestamp).to eq(project.updated_at.floor)
      expect(project_status.dimension_project_id).to eq(project.id)
    end
  end

  shared_examples 'shared examples' do
    include_examples 'project can have status', 'draft'
    include_examples 'project can have status', 'published'
    include_examples 'project can have status', 'archived'
    include_examples 'project can have status', 'deleted'

    it 'only reports the last status' do
      LogActivityJob.perform_now(project, 'draft', user, project.updated_at.to_i - 10)
      LogActivityJob.perform_now(project, 'published', user, project.updated_at.to_i)

      expect(described_class.find_by(dimension_project_id: project.id, status: 'draft')).to be_nil
    end

    it "doesn't report unknown statuses" do
      LogActivityJob.perform_now(project, 'unknown-status', user, project.updated_at.to_i)

      expect(described_class.find_by(status: 'unknown-status')).to be_nil
    end
  end

  context 'when the project is continuous' do
    let_it_be(:project) { create(:continuous_project) }

    context 'and archived' do
      let(:archived_at) { Time.now }

      before { LogActivityJob.perform_now(project, 'archived', user, archived_at) }

      it 'the project is also finished', :aggregate_failures do
        expect(described_class.count).to eq(2) # archived and finished

        project_status = described_class.find_by(status: 'finished')
        expect(project_status.dimension_project_id).to eq(project.id)

        # We round the timestamps for comparison because postgres timestamps are stored with
        # a smaller precision than Ruby timestamp when running the CI.
        expect(project_status.timestamp.round).to eq(archived_at.round)
      end
    end

    include_examples 'shared examples'
  end

  context 'when the project has a timeline' do
    let!(:project) { phase.project }
    let(:phase) { create(:phase, start_at: Time.zone.today - 10, end_at: end_date) }
    let(:end_date) { Time.zone.today + 10 }

    context 'and its last phase is finished' do
      let(:end_date) { Time.zone.today - 5 }

      it 'the project is also finished', :aggregate_failures do
        expect(described_class.count).to eq(1)

        project_status = described_class.first
        expect(project_status.timestamp).to eq (phase.end_at + 1).to_time(:utc)
        expect(project_status.dimension_project_id).to eq(project.id)
        expect(project_status.status).to eq('finished')
      end
    end

    context 'and its last phase is not finished' do
      let(:end_date) { Time.zone.today + 10 }

      it 'the project is not finished', :aggregate_failures do
        expect(described_class.count).to eq(0)
      end
    end

    include_examples 'shared examples'
  end
end
