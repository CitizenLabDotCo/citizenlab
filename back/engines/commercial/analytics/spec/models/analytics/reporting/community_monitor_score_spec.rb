# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::CommunityMonitorScore do
  let(:phase) { create(:community_monitor_survey_phase) }
  let(:form) { create(:custom_form, participation_context: phase) }
  let(:question) { create(:custom_field_sentiment_linear_scale, resource: form, question_category: 'quality_of_life') }

  before { create(:idea_status_proposed) }

  def respond(value, **attributes)
    response = create(:native_survey_response, project: phase.project, creation_phase: phase, **attributes)
    response.custom_field_answers.create!(key: question.key, value: value)
    response
  end

  it 'aggregates answers per quarter and question' do
    respond(2, created_at: Time.zone.parse('2026-02-10 12:00'))
    respond(5, created_at: Time.zone.parse('2026-03-20 12:00'))
    respond(4, created_at: Time.zone.parse('2026-04-15 12:00'))

    rows = described_class.where(question_id: question.id).order(:quarter)

    expect(rows.map { |row| [row.year, row.quarter, row.answer_count, row.answer_sum.to_i, row.average.to_f] })
      .to eq [[2026, 1, 2, 7, 3.5], [2026, 2, 1, 4, 4.0]]
    expect(rows.first).to have_attributes(phase_id: phase.id, question_category: 'quality_of_life', staff: false)
  end

  it 'splits answers by staff and non-staff authors' do
    respond(1, author: create(:admin))
    respond(5, author: create(:user))
    respond(3, author: nil)

    rows = described_class.where(question_id: question.id)

    expect(rows.to_h { |row| [row.staff, row.answer_count] }).to eq(true => 1, false => 2)
  end

  it 'puts responses in quarters in the platform timezone' do
    settings = AppConfiguration.instance.settings
    settings['core']['timezone'] = 'America/New_York'
    AppConfiguration.instance.update_column(:settings, settings)
    respond(3, created_at: Time.utc(2026, 4, 1, 2)) # 31 March, 22:00 in New York

    expect(described_class.find_by!(question_id: question.id).quarter).to eq 1
  end

  it 'leaves out submitted but unpublished responses' do
    respond(3, publication_status: 'submitted')

    expect(described_class.where(question_id: question.id)).to be_empty
  end

  it 'leaves out disabled questions' do
    respond(3)
    question.update!(enabled: false)

    expect(described_class.where(question_id: question.id)).to be_empty
  end
end
