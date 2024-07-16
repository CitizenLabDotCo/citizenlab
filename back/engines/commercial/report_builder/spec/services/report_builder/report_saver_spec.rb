# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::ReportSaver do
  subject(:service) { described_class.new(report, instance_double(User)) }

  let(:report) { create(:report) }

  it 'saves report' do
    report.name = 'Some new name'
    report.layout.craftjs_json = { ROOT: {}, 'key' => 'value' }
    service.save
    expect(report.reload.name).to eq('Some new name')
  end

  it "doesn't save report when it cannot be published" do
    report.name = 'Some new name'
    report.layout.craftjs_json = { ROOT: {}, 'key' => 'value' }
    allow_any_instance_of(ReportBuilder::ReportPublisher).to receive(:publish).and_raise(ActiveRecord::RecordNotFound)

    expect { service.save }.to raise_error(ActiveRecord::RecordNotFound)
    expect(report.reload.name).not_to eq('Some new name')
  end
end
