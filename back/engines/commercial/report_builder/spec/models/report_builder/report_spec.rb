# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Report do
  subject(:report) { build(:report) }

  it 'cannot be associated to the same phase as another report' do
    other_report = create(:report, :with_phase)
    report.phase = other_report.phase
    expect(report).not_to be_valid
    expect(report.errors[:phase_id]).to include('has already been taken')
  end

  it 'can be associated to the same phase as another report for a community monitor phase' do
    phase = create(:community_monitor_survey_phase)
    other_report = create(:report, phase: phase)
    report.phase = other_report.phase
    expect(report).to be_valid
  end

  it 'can be visible only if associated to a phase' do
    report.phase_id = nil
    report.visible = true
    expect(report).not_to be_valid
    expect(report.errors[:visible]).to include('is not included in the list')
  end

  it { is_expected.to validate_uniqueness_of(:name) }
  it { is_expected.to belong_to(:owner).class_name('User').optional }
  it { is_expected.to have_one(:layout).class_name('ContentBuilder::Layout').dependent(:destroy) }

  describe 'quarter' do
    it 'is valid if nil' do
      report.quarter = nil
      expect(report).to be_valid
    end

    it 'is valid if between 1 and 4' do
      report.quarter = 2
      expect(report).to be_valid
    end

    it 'is invalid if less than 1' do
      report.quarter = 0
      expect(report).not_to be_valid
    end

    it 'is invalid if greater than 4' do
      report.quarter = 5
      expect(report).not_to be_valid
    end
  end

  describe 'year' do
    it 'is valid if nil' do
      report.year = nil
      expect(report).to be_valid
    end

    it 'is valid if between 2024 and 2050' do
      report.year = 2025
      expect(report).to be_valid
    end

    it 'is invalid if less than 2024' do
      report.year = 2023
      expect(report).not_to be_valid
    end

    it 'is invalid if greater than 2050' do
      report.year = 2051
      expect(report).not_to be_valid
    end
  end

  describe 'user deletion' do
    it 'keeps reports that the user owned' do
      report = create(:report)
      user = report.owner
      expect(user.destroy).to be_truthy
      expect(report.reload.owner).to be_nil
    end
  end
end
