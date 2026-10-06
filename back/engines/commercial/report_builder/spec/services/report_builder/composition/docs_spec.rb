# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::Docs do
  it 'offers the notes that are on disk, in a fixed order' do
    expect(described_class.topics).to eq %w[config layout queries recharts]
  end

  it 'reads a topic' do
    expect(described_class.read('recharts')).to include 'ResponsiveContainer'
    expect(described_class.read('queries')).to include 'reporting_contributions'
  end

  it 'is nil for a topic it does not have, whatever the path looks like' do
    expect(described_class.read('nope')).to be_nil
    expect(described_class.read('../docs')).to be_nil
    expect(described_class.read(nil)).to be_nil
  end
end
