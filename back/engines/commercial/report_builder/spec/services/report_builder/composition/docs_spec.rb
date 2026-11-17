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

  # A sample in the notes is what the model copies, so one that does not run costs a round
  # in every run that reads it — and a column name that is merely wrong rather than absent
  # costs nothing visible, which is worse.
  describe 'the samples' do
    # rubocop:disable RSpec/BeforeAfterAll -- role is cluster-global; set up once.
    before(:all) do
      McpServer::AnalyticsReaderProvisioner.ensure_role!
      Apartment.tenant_names.each { |schema| McpServer::AnalyticsReaderProvisioner.grant!(schema) }
    end
    # rubocop:enable RSpec/BeforeAfterAll

    def samples(topic, language)
      described_class.read(topic).scan(/```#{language}\n(.*?)```/m).flatten
    end

    it 'runs every query through the sandbox and the database' do
      queries = samples('queries', 'sql')
      expect(queries).not_to be_empty

      queries.each do |sql|
        # The notes write an id the context supplies as '...'.
        query = sql.gsub("'...'", "'#{SecureRandom.uuid}'")
        expect { McpServer::ReportingQueryRunner.run(query) }.not_to raise_error, query
      end
    end

    it 'patches every layout fragment into a layout the validator accepts' do
      fragments = samples('layout', 'json')
      expect(fragments).not_to be_empty

      fragments.each do |fragment|
        nodes = JSON.parse("{#{fragment}}".gsub('<from author_chart_block>', SecureRandom.uuid))
        # A fragment names only its own nodes; it may point at ids it does not carry.
        nodes.each_value { |node| node['nodes'] = (node['nodes'] || []) & nodes.keys }
        top = nodes.select { |_id, node| node['parent'] == 'ROOT' }.keys
        nodes['ROOT'] = {
          'type' => 'div', 'isCanvas' => true, 'props' => {}, 'custom' => {}, 'hidden' => false,
          'displayName' => 'div', 'nodes' => top, 'linkedNodes' => {}
        }

        result = ReportBuilder::Craftjs::LayoutValidator.validate(nodes)
        expect(result).to be_valid, "#{fragment}\n#{result.message}"
      end
    end
  end
end
