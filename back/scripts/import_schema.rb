#!/usr/bin/env ruby
# frozen_string_literal: true

# Script to import a SQL dump into a new schema in PostgreSQL
# Uses credentials from env_files/back-safe.env
#
# Usage: ruby import_schema.rb <schema_name> <sql_file>
# Example: ruby import_schema.rb new_tenant dumps/localhost_schema_20251205_180448.sql

require 'fileutils'
require 'securerandom'

# Check for required arguments
if ARGV.length < 2
  puts "Usage: ruby #{File.basename(__FILE__)} <schema_name> <sql_file>"
  puts "Example: ruby #{File.basename(__FILE__)} new_tenant dumps/localhost_schema_20251205_180448.sql"
  exit 1
end

SCHEMA_NAME = ARGV[0]
SQL_FILE = ARGV[1]

# Resolve SQL file path
sql_file_path = if File.absolute_path?(SQL_FILE)
                  SQL_FILE
                else
                  File.expand_path(SQL_FILE, Dir.pwd)
                end

unless File.exist?(sql_file_path)
  puts "Error: SQL file not found: #{sql_file_path}"
  exit 1
end

# Parse env file manually to avoid gem dependencies
def load_env_file(path)
  return unless File.exist?(path)

  File.readlines(path).each do |line|
    line = line.strip
    next if line.empty? || line.start_with?('#')

    key, value = line.split('=', 2)
    next unless key && value

    # Remove surrounding quotes if present
    value = value.gsub(/\A["']|["']\z/, '')
    ENV[key] = value unless ENV.key?(key)
  end
end

# Load environment variables from back-safe.env
env_file = File.expand_path('../../../env_files/back-safe.env', __FILE__)
load_env_file(env_file)

# Database configuration
DB_USER = ENV.fetch('POSTGRES_USER', 'postgres')
DB_PASSWORD = ENV.fetch('POSTGRES_PASSWORD', 'postgres')
DB_HOST = ENV.fetch('POSTGRES_HOST', 'localhost')
DB_NAME = 'cl2_back_development'

# Set password via environment variable for psql
ENV['PGPASSWORD'] = DB_PASSWORD

puts "Importing SQL into schema '#{SCHEMA_NAME}' in database '#{DB_NAME}'..."
puts "Host: #{DB_HOST}"
puts "User: #{DB_USER}"
puts "SQL file: #{sql_file_path}"
puts

# Read the SQL file
sql_content = File.read(sql_file_path)

# Detect the original schema name from the SQL dump
# Look for CREATE SCHEMA or SET search_path statements
original_schema = nil
if sql_content =~ /CREATE SCHEMA (?:IF NOT EXISTS )?(\w+)/i
  original_schema = $1
elsif sql_content =~ /SET search_path = (\w+)/i
  original_schema = $1
end

if original_schema && original_schema != SCHEMA_NAME
  puts "Replacing schema name '#{original_schema}' with '#{SCHEMA_NAME}'..."
  sql_content = sql_content.gsub(/\b#{Regexp.escape(original_schema)}\b/, SCHEMA_NAME)
end

# Write modified SQL to a temp file
temp_file = "/tmp/import_schema_#{SCHEMA_NAME}_#{Process.pid}.sql"
File.write(temp_file, sql_content)

# Build psql command to import the SQL
psql_cmd = [
  'psql',
  "-h #{DB_HOST}",
  "-U #{DB_USER}",
  "-d #{DB_NAME}",
  "-f #{temp_file}"
].join(' ')

# Execute psql
success = system(psql_cmd)

# Clean up temp file
FileUtils.rm_f(temp_file)

unless success
  puts
  puts "Error: psql failed with exit code #{$?.exitstatus}"
  exit 1
end

puts
puts "Schema '#{SCHEMA_NAME}' imported successfully."
puts

# Get the app_configuration ID from the imported schema to use as tenant ID
puts "Fetching app_configuration ID from imported schema..."

get_app_config_id_sql = "SELECT id FROM #{SCHEMA_NAME}.app_configurations LIMIT 1;"
app_config_result = `psql -h #{DB_HOST} -U #{DB_USER} -d #{DB_NAME} -t -A -c "#{get_app_config_id_sql}"`.strip

if app_config_result.empty?
  puts "Warning: No app_configuration found in schema. Using new UUID."
  tenant_id = SecureRandom.uuid
else
  tenant_id = app_config_result
  puts "Using app_configuration ID: #{tenant_id}"
end

# Insert tenant record into public.tenants
tenant_host = SCHEMA_NAME
now = Time.now.utc.strftime('%Y-%m-%d %H:%M:%S')

# Escape single quotes in schema name for SQL
escaped_name = SCHEMA_NAME.gsub("'", "''")
escaped_host = tenant_host.gsub("'", "''")

tenant_insert_sql = <<~SQL
  INSERT INTO public.tenants (id, name, host, settings, style, created_at, updated_at, creation_finalized_at)
  SELECT
    '#{tenant_id}',
    '#{escaped_name}',
    '#{escaped_host}',
    '{}',
    '{}',
    '#{now}',
    '#{now}',
    '#{now}'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tenants WHERE host = '#{escaped_host}'
  );
SQL

puts "Inserting tenant record..."
puts "  ID: #{tenant_id}"
puts "  Name: #{SCHEMA_NAME}"
puts "  Host: #{tenant_host}"

# Write tenant insert SQL to temp file
tenant_temp_file = "/tmp/insert_tenant_#{SCHEMA_NAME}_#{Process.pid}.sql"
File.write(tenant_temp_file, tenant_insert_sql)

# Build psql command to insert tenant
psql_tenant_cmd = [
  'psql',
  "-h #{DB_HOST}",
  "-U #{DB_USER}",
  "-d #{DB_NAME}",
  "-f #{tenant_temp_file}"
].join(' ')

# Execute psql for tenant insert
tenant_success = system(psql_tenant_cmd)

# Clean up temp file
FileUtils.rm_f(tenant_temp_file)

if tenant_success
  puts
  puts "Success! Tenant record inserted into public.tenants."
else
  puts
  puts "Warning: Failed to insert tenant record (exit code #{$?.exitstatus})"
  puts "The schema was imported but you may need to manually add the tenant record."
end
