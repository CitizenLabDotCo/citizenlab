require 'rails_helper'

RSpec.describe HasRoles::RecordsOrIds do
  before do
    create_list(:user, 10)
  end

  let(:records) { User.first(5) }
  let(:ids)     { records.pluck(:id) }

  context 'when receiving a set of ids' do
    subject { described_class.new(ids) }

    describe '#records' do
      it 'returns a set of records when klass passed' do
        expect(subject.records(User)).to include(*records)
      end

      it 'returns an empty array when no klass passed' do
        expect(subject.records).to be_empty
      end
    end

    describe '#ids' do
      it 'returns the original ids' do
        expect(subject.ids).to include(*ids)
      end
    end
  end

  context 'when receiving a set of records' do
    subject { described_class.new(records) }

    describe '#ids' do
      it 'returns the record ids' do
        expect(subject.ids).to include(*ids)
      end
    end

    describe '#records' do
      it 'returns the original records' do
        expect(subject.records).to include(*records)
      end
    end
  end
end
