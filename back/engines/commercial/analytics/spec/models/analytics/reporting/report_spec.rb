# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Report do
  it 'exposes a phase report with its phase, project and visibility' do
    phase = create(:information_phase)
    report = create(:report, :visible, phase: phase)
    row = described_class.find(report.id)

    expect(row).to have_attributes(
      name: report.name,
      phase_id: phase.id,
      project_id: phase.project_id,
      visible: true,
      community_monitor: false
    )
  end

  it 'exposes an internal report without a phase or project' do
    report = create(:report)

    expect(described_class.find(report.id)).to have_attributes(phase_id: nil, project_id: nil, visible: false)
  end

  it 'exposes the period of a community monitor report' do
    report = create(:report, community_monitor: true, year: 2026, quarter: 3)

    expect(described_class.find(report.id)).to have_attributes(community_monitor: true, year: 2026, quarter: 3)
  end
end
