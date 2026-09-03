# frozen_string_literal: true

require 'rails_helper'
require 'zip'

# The two Power BI files we ship - report.pbit and dataflow.json - hard-code, per
# query, the column names they expect back from the public API v2. Power Query
# types those columns explicitly, so a dropped or renamed serializer attribute
# fails the whole query, and it fails on the customer's next refresh rather than
# in our CI. Endpoints are pinned the same way: a query names its endpoint in
# ApiGET("..."), which 404s once a route goes.
#
# These specs pin both files to the API. A failure means either the API change
# needs a backwards-compatible shim (see PhaseSerializer#start_at, which kept
# start_at/end_at in the payload after the columns became datetimes), or the two
# files need updating and reshipping to customers.
describe 'Power BI files' do # rubocop:disable RSpec/DescribeClass
  # Query name in the file => serializer that renders its endpoint.
  def serializers
    {
      'baskets' => PublicApi::V2::BasketSerializer,
      'basket_ideas' => PublicApi::V2::BasketIdeaSerializer,
      'comments' => PublicApi::V2::CommentSerializer,
      'email_campaigns' => PublicApi::V2::EmailCampaignSerializer,
      'email_campaign_deliveries' => PublicApi::V2::EmailCampaignDeliverySerializer,
      'event_attendances' => PublicApi::V2::EventAttendanceSerializer,
      'events' => PublicApi::V2::EventSerializer,
      'idea_phases' => PublicApi::V2::IdeaPhaseSerializer,
      'idea_topics' => PublicApi::V2::IdeaTopicSerializer,
      'ideas' => PublicApi::V2::IdeaSerializer,
      'ideas_custom_fields' => PublicApi::V2::IdeaSerializer, # dataflow only: flattens ideas.custom_field_values
      'phases' => PublicApi::V2::PhaseSerializer,
      'project_folders' => PublicApi::V2::ProjectFolders::FolderSerializer,
      'project_topics' => PublicApi::V2::ProjectTopicSerializer,
      'projects' => PublicApi::V2::ProjectSerializer,
      'reactions' => PublicApi::V2::ReactionSerializer,
      'topics' => PublicApi::V2::TopicSerializer,
      'users' => PublicApi::V2::UserSerializer,
      'users_custom_fields' => PublicApi::V2::UserSerializer, # dataflow only: flattens users.custom_field_values
      'volunteering_causes' => PublicApi::V2::VolunteeringCauseSerializer,
      'volunteering_volunteers' => PublicApi::V2::VolunteeringVolunteerSerializer
    }
  end

  # Columns the queries build themselves, so they have no API counterpart:
  # ApiGET stamps every row with data_refreshed_at, and the queries duplicate a
  # timestamp into a date column for the Calendar relationships.
  def local_columns
    %w[data_refreshed_at created_at_date registration_completed_at_date]
  end

  def power_bi_dir
    PublicApi::Engine.root.join('files/power_bi')
  end

  # Each query declares its columns twice: in the empty-table fallback used when
  # the endpoint returns no rows, and in the type conversions. Both have to hold.
  def declared_columns(expression)
    fallback = expression[/otherwise\s+#table\(\{(.*?)\}\s*,\s*\{\}\)/m, 1].to_s.scan(/"([^"]+)"/).flatten
    typed = expression.scan(/\{"([^"]+)",\s*(?:type\s+\w+|Int64\.Type)\}/).flatten
    (fallback + typed).uniq
  end

  # { query name => M expression }, for the queries that read the public API.
  def api_queries(document)
    document.split("\nshared ").drop(1).filter_map do |chunk|
      name, expression = chunk.split(' =', 2)
      [name.strip, expression] if expression.include?('ApiGET(')
    end.to_h
  end

  def dataflow
    @dataflow ||= JSON.parse(File.read(power_bi_dir.join('dataflow.json')))
  end

  def dataflow_queries
    api_queries(dataflow.dig('pbi:mashup', 'document'))
  end

  # The .pbit keeps the same M in its model partitions (DataModelSchema, UTF-16LE
  # JSON inside the zip) and in the Power Query editor's copy (UnappliedChanges).
  def report_model
    @report_model ||= Zip::File.open(power_bi_dir.join('report.pbit')) do |zip|
      JSON.parse(zip.read('DataModelSchema').force_encoding('UTF-16LE').encode('UTF-8'))
    end
  end

  def report_queries
    report_model.dig('model', 'tables').filter_map do |table|
      expression = table.dig('partitions', 0, 'source', 'expression')
      next if expression.blank?

      expression = Array(expression).join("\n")
      [table['name'], expression] if expression.include?('ApiGET(')
    end.to_h
  end

  { 'report.pbit' => :report_queries, 'dataflow.json' => :dataflow_queries }.each do |file, loader|
    context file do
      let(:queries) { public_send(loader) }

      it 'only loads endpoints the public API still routes' do
        queries.each_value do |expression|
          endpoint = expression[/ApiGET\("([a-z_]+)"\)/, 1]
          route = "/api/v2/#{endpoint}"

          expect { Rails.application.routes.recognize_path(route, method: :get) }
            .not_to raise_error, "#{file} requests #{route}, which the API no longer routes"
        end
      end

      it 'only loads fields the serializers still expose' do
        queries.each do |name, expression|
          serializer = serializers.fetch(name) do
            raise "#{file} has a query named #{name} that this spec does not know about - " \
                  'add it to `serializers` (or remove the query if its endpoint is gone)'
          end

          exposed = serializer._attributes.map(&:to_s)
          missing = declared_columns(expression) - exposed - local_columns

          expect(missing).to be_empty,
            "#{file}: the #{name} query loads #{missing.join(', ')}, which #{serializer} no longer exposes. " \
            'Renaming or dropping a public API field breaks the refresh for every customer running the ' \
            'shipped file, so either keep the field in the payload or update and reship both Power BI files.'
        end
      end
    end
  end

  it 'declares the same columns in both files' do
    shared = report_queries.keys & dataflow_queries.keys

    shared.each do |name|
      expect(declared_columns(dataflow_queries.fetch(name)))
        .to match_array(declared_columns(report_queries.fetch(name))),
          "the #{name} query differs between report.pbit and dataflow.json - they are generated from the " \
          'same API and are meant to stay in step'
    end
  end

  it 'describes each dataflow entity with the columns its query returns' do
    dataflow['entities'].each do |entity|
      expression = dataflow_queries[entity['name']]
      next if expression.nil? || entity['name'].end_with?('_custom_fields') # columns vary per tenant

      attributes = entity['attributes'].pluck('name')
      expect(attributes).to match_array(declared_columns(expression)),
        "the #{entity['name']} entity schema does not match what its query returns"
    end
  end
end
