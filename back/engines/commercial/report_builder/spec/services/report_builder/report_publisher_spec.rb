# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::ReportPublisher do
  subject(:service) { described_class.new(report, instance_double(User)) }

  let(:phase) { create(:phase) }

  let(:report) do
    layout = build(:layout, craftjs_json: {
      ROOT: {},
      '5Hk6BOKxfJ' => {
        'type' => { 'resolvedName' => 'SurveyQuestionResultWidget' },
        'nodes' => [],
        'props' => { 'phaseId' => phase.id, 'projectId' => phase.project.id, 'questionId' => '' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'i6qbawCoDc',
        'isCanvas' => false,
        'displayName' => 'SurveyQuestionResultWidget',
        'linkedNodes' => {}
      }
    })
    create(:report, layout: layout, phase: phase)
  end

  it 'publishes report data' do
    expect { service.publish }.to change(ReportBuilder::PublishedGraphDataUnit, :count).from(0).to(1)
  end
end
