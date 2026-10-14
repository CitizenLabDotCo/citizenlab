# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::EmailDelivery do
  # Admins only see these totals for manual campaigns, but status_counts
  # serves any campaign, and the view counts automatic ones the same way.
  where(:campaign_factory) do
    [[:manual_campaign], [:project_phase_started_campaign]]
  end

  with_them do
    it 'gives the same totals per campaign as the campaign page' do
      campaign = create(campaign_factory)
      %w[sent bounced failed accepted delivered opened clicked clicked].each_with_index do |status, index|
        create(:delivery, campaign: campaign, delivery_status: status, sent_at: Time.zone.parse('2026-03-12 10:00') + index.days)
      end

      view_rows = described_class.where(campaign_id: campaign.id)
      view_totals = %i[sent bounced failed accepted delivered opened clicked].index_with { |status| view_rows.sum(:"#{status}_count") }
      campaign_page_totals = EmailCampaigns::Delivery.status_counts(campaign.id)

      expect(view_totals).to eq campaign_page_totals.except(:total)
      expect(campaign_page_totals[:total]).to eq campaign_page_totals[:sent]
    end
  end

  it 'gives one row per campaign and day sent, with the subject of a manual campaign' do
    campaign = create(:manual_campaign, subject_multiloc: { 'en' => 'Have your say on the park' })
    create_list(:delivery, 2, campaign: campaign, sent_at: Time.zone.parse('2026-03-12 10:00'))
    create(:delivery, campaign: campaign, sent_at: Time.zone.parse('2026-03-13 10:00'))

    rows = described_class.where(campaign_id: campaign.id).order(:sent_date)

    expect(rows.map { |row| [row.sent_date, row.sent_count, row.campaign_type, row.manual, row.subject] }).to eq [
      [Date.new(2026, 3, 12), 2, 'manual', true, 'Have your say on the park'],
      [Date.new(2026, 3, 13), 1, 'manual', true, 'Have your say on the park']
    ]
  end

  it 'links campaigns about a project or one of its phases to the project' do
    project_campaign = create(:manual_project_participants_campaign)
    phase = create(:phase)
    phase_campaign = create(:project_phase_started_campaign, context: phase)
    [project_campaign, phase_campaign].each { |campaign| create(:delivery, campaign: campaign) }

    view_projects = described_class.pluck(:campaign_id, :project_id).to_h

    expect(view_projects).to eq(project_campaign.id => project_campaign.context_id, phase_campaign.id => phase.project_id)
  end

  it 'names and flags every email campaign type like the campaign classes do' do
    campaign = create(:manual_campaign)
    create(:delivery, campaign: campaign)
    email_classes = EmailCampaigns::DeliveryService.new.all_campaign_classes.reject { |klass| klass.new.sms? }

    email_classes.each do |klass|
      campaign.update_column(:type, klass.name)
      row = described_class.find_by!(campaign_id: campaign.id)

      expect([row.campaign_type, row.manual]).to eq([klass.campaign_name, klass.new.manual?]), klass.name
    end
  end

  it 'puts deliveries on days in the platform timezone' do
    settings = AppConfiguration.instance.settings
    settings['core']['timezone'] = 'America/New_York'
    AppConfiguration.instance.update_column(:settings, settings)
    create(:delivery, sent_at: Time.utc(2026, 4, 1, 2)) # 31 March, 22:00 in New York

    expect(described_class.pick(:sent_date)).to eq Date.new(2026, 3, 31)
  end
end
