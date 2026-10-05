# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::CustomBlocks::BlockBuilder do
  subject(:builder) { described_class.new }

  let(:build_url) { 'http://custom_block_sandbox:3100/build' }
  let(:source) { 'export default () => null;' }
  let(:sql) { 'SELECT count(*) AS count FROM reporting_contributions' }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('CUSTOM_BLOCK_SANDBOX_SECRET', nil).and_return('test-secret')
  end

  def stub_build(body)
    stub_request(:post, build_url).to_return(
      status: 200,
      body: body.to_json,
      headers: { 'Content-Type' => 'application/json' }
    )
  end

  def build(**overrides)
    builder.call(source: source, manifest: { 'targets' => ['report'] }, locales: ['en'], **overrides)
  end

  describe 'a block that builds and whose queries are allowed' do
    before do
      stub_build(
        ok: true,
        bundle: 'export default () => null;',
        manifest: { 'targets' => ['report'], 'queries' => [sql] },
        toolchain: { 'esbuild' => '0.28.2' }
      )
    end

    it 'is ok, with the bundle and the toolchain that produced it' do
      result = build

      expect(result).to be_ok
      expect(result.bundle).to eq 'export default () => null;'
      expect(result.toolchain).to eq('esbuild' => '0.28.2')
      expect(result.diagnostics).to be_empty
    end

    # The sandbox's normalized form, not what the model typed: it is the key a
    # snapshot hangs off, and it is what an audit of "who reads this view?" compares.
    it 'stores the normalized SQL on the manifest' do
      expect(build.manifest['queries'].first).to eq McpServer::SqlSandboxer.validate(sql).normalized_sql
    end
  end

  describe 'a block the service rejected' do
    before do
      stub_build(
        ok: false,
        bundle: nil,
        manifest: { 'queries' => [] },
        diagnostics: [
          { 'kind' => 'type', 'line' => 3, 'column' => 9, 'message' => "Property 'rows' does not exist." },
          { 'kind' => 'lint', 'line' => 2, 'column' => nil, 'rule' => 'no-network', 'message' => 'No fetch.' }
        ]
      )
    end

    it 'is not ok and has no bundle' do
      result = build

      expect(result).not_to be_ok
      expect(result.bundle).to be_nil
    end

    it 'reads back as one block of text a model can act on' do
      text = build.diagnostics_text

      expect(text).to include "[type] line 3:9: Property 'rows' does not exist."
      expect(text).to include '[lint] line 2: No fetch. (no-network)'
    end
  end

  describe 'a block whose query the sandbox refuses' do
    before do
      stub_build(
        ok: true,
        bundle: 'export default () => null;',
        manifest: { 'queries' => ['SELECT * FROM users'] }
      )
    end

    it 'is not ok even though the source itself compiled' do
      expect(build).not_to be_ok
    end

    it 'says which query was refused and why' do
      expect(build.diagnostics_text).to match(/\[sql\] Query 1 was rejected\..*users/m)
    end

    it 'withholds the bundle, so nothing can store a block that would fail at read time' do
      expect(build.bundle).to be_nil
    end
  end

  describe 'locales' do
    before { stub_build(ok: true, bundle: 'x', manifest: {}) }

    it 'falls back to the tenant locales when the caller names none' do
      SettingsService.new.activate_feature!('llm_reporting')
      tenant_locales = AppConfiguration.instance.settings('core', 'locales')

      builder.call(source: source, manifest: {})

      expect(a_request(:post, build_url).with { |req| JSON.parse(req.body)['locales'] == tenant_locales })
        .to have_been_made
    end
  end
end
