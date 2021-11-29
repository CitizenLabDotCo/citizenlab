require 'rails_helper'

RSpec.describe ErrorReporter do
  describe '.handle' do
    it 'captures and reports errors' do
      expect(described_class).to receive(:report).with(instance_of(TypeError)).and_call_original
      described_class.handle do
        1 + nil
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

    it 'repors in-line created errors which do not have backtrace' do
      error = StandardError.new('test')
      expect_report(error)
      described_class.report(error)
    end

    it 'repors runtime errors' do
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
