# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Craftjs::WidgetSpecs do
  describe '.with_allowed_ids' do
    let(:specs) { described_class.with_allowed_ids('blockId' => %w[b1 b2]) }

    it 'pins an id prop to the given values, on the widget that carries it' do
      expect(specs.dig('CustomBlock', 'enums', 'blockId')).to eq %w[b1 b2]
    end

    it 'leaves the id prop off widgets that do not carry it' do
      expect(specs.dig('TextMultiloc', 'enums')).to be_nil
      expect(specs.dig('ParticipantsWidget', 'enums')).not_to have_key 'blockId'
    end

    it 'keeps the widget rules that were already there' do
      expect(specs.dig('ParticipantsWidget', 'enums', 'resolution')).to eq %w[day week month]
      expect(specs.dig('ParticipantsWidget', 'multilocs')).to include 'title'
    end

    it 'does not change the specs it was built from' do
      described_class.with_allowed_ids('blockId' => %w[b1])

      expect(described_class::SPECS.dig('CustomBlock', 'enums')).to be_nil
    end

    it 'covers every widget, so a graph still validates as a whole' do
      expect(specs.keys).to match_array described_class::SPECS.keys
    end
  end

  describe 'ID_PROPS' do
    it 'only names widgets that exist' do
      expect(described_class::ID_PROPS.values.flatten.uniq - described_class::SPECS.keys).to be_empty
    end
  end
end
