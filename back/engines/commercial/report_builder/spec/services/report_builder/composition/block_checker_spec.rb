# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Composition::BlockChecker do
  subject(:checker) { described_class.new(layout: layout, author: author, locale: 'en', client: client) }

  let(:layout) { create(:layout) }
  let(:author) { create(:admin) }
  let(:client) { instance_double(ContentBuilder::CustomBlocks::SandboxClient) }

  let(:picture) { png }

  let(:passing) do
    {
      'checks' => [
        { 'id' => 'mounted', 'ok' => true, 'message' => 'The block mounted.' },
        { 'id' => 'has_data_points', 'ok' => true, 'message' => 'Every chart drew its data.' }
      ],
      'errors' => [], 'console' => [], 'failedRequests' => [], 'screenshot' => picture
    }
  end

  let(:failing) do
    {
      'checks' => [
        { 'id' => 'mounted', 'ok' => true, 'message' => 'The block mounted.' },
        { 'id' => 'has_data_points', 'ok' => false, 'message' => '1 chart rendered no data.' }
      ],
      'errors' => [], 'console' => ['error: nothing to plot'], 'failedRequests' => [],
      'screenshot' => picture
    }
  end

  # Just enough of a PNG for the size to be read off its header.
  def png(width: 794, height: 600)
    Base64.strict_encode64("\x89PNG\r\n\x1a\n".b + [13].pack('N') + 'IHDR'.b + [width, height].pack('N2'))
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

      expect(checker.check(checker.layout_target({}))[:screenshot]).to eq picture
    end

    it 'keeps the picture back when everything passed' do
      allow(client).to receive(:render).and_return(passing)

      expect(checker.check(checker.layout_target({}))[:screenshot]).to be_nil
    end

    it 'sends the picture anyway when it was asked for' do
      allow(client).to receive(:render).and_return(passing)

      expect(checker.check(checker.layout_target({}), screenshot: true)[:screenshot]).to eq picture
    end

    # A provider refuses the whole turn over one oversize image, which would end the
    # run; a dropped picture costs the model a look, nothing more.
    it 'drops a picture too large for the provider, and says so' do
      allow(client).to receive(:render).and_return(failing.merge('screenshot' => png(width: 1588, height: 13_444)))

      outcome = checker.check(checker.layout_target({}))

      expect(outcome[:screenshot]).to be_nil
      expect(outcome[:text]).to include 'too large to send'
    end

    it 'says when the picture shows only the top of the report' do
      allow(client).to receive(:render).and_return(passing.merge('screenshotClipped' => true))

      outcome = checker.check(checker.layout_target({}), screenshot: true)

      expect(outcome[:screenshot]).to eq picture
      expect(outcome[:text]).to include 'shows the top of the report'
    end

    it 'drops a picture that is not a readable PNG rather than guessing' do
      allow(client).to receive(:render).and_return(failing.merge('screenshot' => 'not base64!'))

      expect(checker.check(checker.layout_target({}))[:screenshot]).to be_nil
    end

    # A renderer that is down is our problem, not the model's: it must not read as
    # "your block is broken".
    it 'says the renderer is unavailable rather than failing the block' do
      allow(client).to receive(:render)
        .and_raise(ContentBuilder::CustomBlocks::SandboxClient::Unavailable, 'connection refused')

      outcome = checker.check(checker.layout_target({}))

      expect(outcome[:text]).to include 'not available'
      expect(outcome[:text]).to include 'Carry on without it'
    end
  end
end
