# frozen_string_literal: true

require 'rails_helper'

describe WhinyOpenStruct do
  describe '#method_missing' do
    context 'when raise_exception is true' do
      it 'raises error when unknown method is called' do
        hash = { qwe: 123 }
        whiny_open_struct = described_class.new(hash)
        expect(ErrorReporter).not_to receive(:report_msg)
        expect { whiny_open_struct.unknown_method }.to raise_error(NoMethodError)
      end

      it 'does not raise error when trying to access existing member' do
        hash = { key: 'value' }
        whiny_open_struct = described_class.new(hash)
        expect(ErrorReporter).not_to receive(:report_msg)
        expect { whiny_open_struct.key }.not_to raise_error
        expect(whiny_open_struct.key).to eq('value')
      end
    end

    context 'when raise_exception is false' do
      it 'does not raise error when unknown method is called' do
        hash = {}
        whiny_open_struct = described_class.new(hash, raise_exception: false)
        expect(ErrorReporter).to receive(:report_msg).and_call_original
        expect { whiny_open_struct.unknown_method }.not_to raise_error
      end

      it 'does not raise error when trying to access existing member' do
        hash = { key: 'value' }
        whiny_open_struct = described_class.new(hash)
        expect(ErrorReporter).not_to receive(:report_msg)
        expect { whiny_open_struct.key }.not_to raise_error
        expect(whiny_open_struct.key).to eq('value')
      end
    end
  end
end
