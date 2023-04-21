# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::SideFxReportService do
  subject(:service) { described_class.new }

  # We do not retest logic from `BaseSideFxService`, instead we just check that
  # `ReportBuilder::SideFxReportService` inherits it.
  specify { expect(described_class).to be < BaseSideFxService }

  let_it_be(:user) { create(:user) }
  let_it_be(:report, reload: true) { create(:report) }

  shared_examples 'runs_layout_side_effects' do |hook_name|
    it "runs #{hook_name} layout side effects" do
      expect_any_instance_of(ContentBuilder::SideFxLayoutService)
        .to receive(hook_name).with(report.layout, user)

      service.send(hook_name, report, user)
    end
  end

  describe 'before_create' do
    include_examples('runs_layout_side_effects', :before_create)
  end

  describe 'after_create' do
    include_examples('runs_layout_side_effects', :after_create)
  end

  describe 'before_update' do
    before do
      report.layout.craftjs_jsonmultiloc = { 'kl-GL': { ROOT: {} } }
    end

    include_examples('runs_layout_side_effects', :before_update)
  end

  describe 'after_update' do
    before do
      report.layout.update!(craftjs_jsonmultiloc: { 'kl-GL': { ROOT: {} } })
    end

    include_examples('runs_layout_side_effects', :after_update)
  end

  describe 'before_destroy' do
    include_examples('runs_layout_side_effects', :before_destroy)
  end

  describe 'after_destroy' do
    include_examples('runs_layout_side_effects', :after_destroy)
  end
end
