# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ErrorReporter do
  describe '.handle' do
    context 'when in test environment' do
      it 'does not capture and report errors' do
        expect(described_class).not_to receive(:report)
        expect do
          described_class.handle { 1 + nil }
        end.to raise_error(TypeError)
      end
    end

    context 'when in production environment' do
      # rubocop:disable RSpec/BeforeAfterAll
      before(:all) do
        Rails.env = 'production'
        load 'lib/error_reporter.rb'
      end

      after(:all) do
        Rails.env = 'test'
        load 'lib/error_reporter.rb'
      end
      # rubocop:enable RSpec/BeforeAfterAll

      it 'captures and reports errors' do
        expect(described_class).to receive(:report).with(instance_of(TypeError)).and_call_original
        expect do
          described_class.handle { 1 + nil }
        end.not_to raise_error
      end
    end
  end

  describe '.report_msg' do
    it 'repors message' do
      expect(Sentry::Rails).to receive(:capture_message).with('test msg', extra: {}).and_call_original
      expect(Rails.logger).to receive(:error).with(instance_of(String), {}).and_call_original
      described_class.report_msg('test msg')
    end

    it 'reports message with extra fields' do
      extra_fields = { user_id: 123 }
      expect(Sentry::Rails).to receive(:capture_message).with('test msg', extra: extra_fields).and_call_original
      expect(Rails.logger).to receive(:error).with(instance_of(String), extra_fields).and_call_original
      described_class.report_msg('test msg', extra: extra_fields)
    end
  end

  describe '.report' do
    def expect_report(error)
      expect(Sentry::Rails).to receive(:capture_exception).with(error, extra: {}).and_call_original
      expect(Rails.logger).to receive(:error).with(instance_of(String), {}).and_call_original
    end

    it 'reports in-line created errors which do not have backtrace' do
      error = StandardError.new('test')
      expect_report(error)
      described_class.report(error)
    end

    it 'reports runtime errors' do
      expect_report(instance_of(TypeError))
      begin
        1 + nil
      rescue StandardError => e
        described_class.report(e)
      end
    end

    it 'reports extra fields' do
      extra_fields = { user_id: 123 }
      expect(Sentry::Rails).to receive(:capture_exception).with(StandardError.new, extra: extra_fields).and_call_original
      expect(Rails.logger).to receive(:error).with(instance_of(String), extra_fields).and_call_original
      described_class.report(StandardError.new, extra: extra_fields)
    end
  end
end
