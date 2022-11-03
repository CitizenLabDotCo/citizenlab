# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactProjectStatus, type: :model do
  subject { described_class.new }

  let(:project) { create(:project) }
  let(:user) { create(:user) }

  it { is_expected.to belong_to(:project) }
  it { is_expected.to belong_to(:dimension_date).with_foreign_key(:date) }

  it 'includes status for created projects', :aggregate_failures do
    LogActivityJob.perform_now(project, 'created', user, project.created_at.to_i)

    expect(described_class.count).to eq(1)
    project_status = described_class.first

    expect(project_status.timestamp).to eq(project.created_at.floor)
    expect(project_status.project_id).to eq(project.id)
    expect(project_status.status).to eq('created')
  end

  it 'includes status for draft projects', :aggregate_failures do
    LogActivityJob.perform_now(project, 'draft', user, project.updated_at.to_i)

    expect(described_class.count).to eq(1)
    project_status = described_class.first

    expect(project_status.timestamp).to eq(project.updated_at.floor)
    expect(project_status.project_id).to eq(project.id)
    expect(project_status.status).to eq('draft')
  end

  it 'includes status for archived projects', :aggregate_failures do
    LogActivityJob.perform_now(project, 'archived', user, project.updated_at.to_i)

    expect(described_class.count).to eq(1)
    project_status = described_class.first

    expect(project_status.timestamp).to eq(project.updated_at.floor)
    expect(project_status.project_id).to eq(project.id)
    expect(project_status.status).to eq('archived')
  end

  it 'includes status for deleted projects', :aggregate_failures do
    encoded_project = SideFxProjectService.new.send(:encode_frozen_resource, project)
    LogActivityJob.perform_now(encoded_project, 'deleted', user, project.updated_at.to_i)

    expect(described_class.count).to eq(1)
    project_status = described_class.first

    expect(project_status.timestamp).to eq(project.updated_at.floor)
    expect(project_status.project_id).to eq(project.id)
    expect(project_status.status).to eq('deleted')
  end

  it 'does not include unknown project statuses', :aggregate_failures do
    LogActivityJob.perform_now(project, 'unknown-status', user, project.updated_at.to_i)

    expect(described_class.count).to eq(0)
  end

  it 'is finished for timeline projects whose last phase is finished', :aggregate_failures do
    phase = create(:phase)
    project = phase.project

    travel_to(phase.end_at + 1) do
      expect(described_class.count).to eq(1)

      project_status = described_class.first
      expect(project_status.timestamp).to eq (phase.end_at + 1).to_time(:utc)
      expect(project_status.project_id).to eq(project.id)
      expect(project_status.status).to eq('finished')
    end
  end

  it 'is finished for archived continuous projects', :aggregate_failures do
    project = create(:continuous_project)
    archived_at = Time.now
    LogActivityJob.perform_now(project, 'archived', user, archived_at)

    expect(described_class.count).to eq(2)

    project_status = described_class.find_by(status: 'finished')
    expect(project_status.project_id).to eq(project.id)
    expect(project_status.timestamp).to eq(archived_at)
  end
end
