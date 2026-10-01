# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Composition::BlockChecker do
  subject(:checker) { described_class.new(layout: layout, author: author, locale: 'en', client: client) }

  let(:layout) { create(:layout) }
  let(:author) { create(:admin) }
  let(:client) { instance_double(ContentBuilder::CustomBlocks::CheckServiceClient) }

  let(:passing) do
    {
      'checks' => [
        { 'id' => 'mounted', 'ok' => true, 'message' => 'The block mounted.' },
        { 'id' => 'has_data_points', 'ok' => true, 'message' => 'Every chart drew its data.' }
      ],
      'errors' => [], 'console' => [], 'failedRequests' => [], 'screenshot' => 'base64png'
    }
  end

  let(:failing) do
    {
      'checks' => [
        { 'id' => 'mounted', 'ok' => true, 'message' => 'The block mounted.' },
        { 'id' => 'has_data_points', 'ok' => false, 'message' => '1 chart rendered no data.' }
      ],
      'errors' => [], 'console' => ['error: nothing to plot'], 'failedRequests' => [],
      'screenshot' => 'base64png'
    }
  end

  describe '#check' do
    it 'scopes the data token to the layout being checked' do
      expect(client).to receive(:render) do |args|
        expect(ContentBuilder::ScopedReportingToken.permits?(args[:token], layout_id: layout.id)).to be true
        expect(args[:layout_id]).to eq layout.id
        passing
      end

      checker.check(checker.layout_target({}))
    end

    it 'says so in one line when everything worked' do
      allow(client).to receive(:render).and_return(passing)

      outcome = checker.check(checker.layout_target({}))

      expect(outcome[:error]).to be false
      expect(outcome[:text]).to eq 'Everything checked out.'
    end

    it 'names what failed, with the detail to act on' do
      allow(client).to receive(:render).and_return(failing)

      outcome = checker.check(checker.layout_target({}))

      expect(outcome[:error]).to be true
      expect(outcome[:text]).to include 'has_data_points'
      expect(outcome[:text]).to include 'rendered no data'
      expect(outcome[:text]).to include 'nothing to plot'
    end

    # Vision tokens are not free: the picture goes over when a verdict alone cannot
    # say what is wrong.
    it 'sends the picture when a check failed' do
      allow(client).to receive(:render).and_return(failing)

      expect(checker.check(checker.layout_target({}))[:screenshot]).to eq 'base64png'
    end

    it 'keeps the picture back when everything passed' do
      allow(client).to receive(:render).and_return(passing)

      expect(checker.check(checker.layout_target({}))[:screenshot]).to be_nil
    end

    it 'sends the picture anyway when it was asked for' do
      allow(client).to receive(:render).and_return(passing)

      expect(checker.check(checker.layout_target({}), screenshot: true)[:screenshot]).to eq 'base64png'
    end

    # A renderer that is down is our problem, not the model's: it must not read as
    # "your block is broken".
    it 'says the renderer is unavailable rather than failing the block' do
      allow(client).to receive(:render)
        .and_raise(ContentBuilder::CustomBlocks::CheckServiceClient::Unavailable, 'connection refused')

      outcome = checker.check(checker.layout_target({}))

      expect(outcome[:text]).to include 'not available'
      expect(outcome[:text]).to include 'Carry on without it'
    end
  end
end
