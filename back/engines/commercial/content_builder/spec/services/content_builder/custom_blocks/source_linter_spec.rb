# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::CustomBlocks::SourceLinter do
  def rules_for(source)
    described_class.lint(source).map(&:rule)
  end

  it 'passes a block that only uses the sdk' do
    source = <<~TSX
      import { React, Box, Text, useReportingData } from 'gv-sdk';

      const SQL = `SELECT 1 AS n`;

      export default function Block() {
        const { data } = useReportingData(SQL);
        return <Box><Text>{data ? data.rows.length : 0}</Text></Box>;
      }
    TSX

    expect(described_class.lint(source)).to be_empty
  end

  it 'reports the line a problem is on' do
    source = "const a = 1;\nconst b = eval('2');\n"

    expect(described_class.lint(source).map(&:line)).to eq [2]
  end

  describe 'forbidden calls' do
    it { expect(rules_for("eval('x')")).to include 'no-eval' }
    it { expect(rules_for('new Function("x")')).to include 'no-eval' }
    it { expect(rules_for("fetch('/api')")).to include 'no-network' }
    it { expect(rules_for('new WebSocket(url)')).to include 'no-network' }
    it { expect(rules_for('navigator.sendBeacon(url)')).to include 'no-network' }
    it { expect(rules_for('localStorage.setItem("a", 1)')).to include 'no-storage' }
    it { expect(rules_for('document.cookie')).to include 'no-storage' }
    it { expect(rules_for('window.open("https://x")')).to include 'no-window-escape' }
    it { expect(rules_for('window.top.location')).to include 'no-window-escape' }
    it { expect(rules_for('const m = import("./x");')).to include 'no-dynamic-import' }
    it { expect(rules_for('<div dangerouslySetInnerHTML={h} />')).to include 'no-raw-html' }
  end

  describe 'imports' do
    it 'allows gv-sdk' do
      expect(rules_for("import { Box } from 'gv-sdk';")).to be_empty
    end

    it 'rejects anything else, naming what it found' do
      diagnostics = described_class.lint("import axios from 'axios';")

      expect(diagnostics.map(&:rule)).to eq ['imports-whitelist']
      expect(diagnostics.first.message).to include 'axios'
    end

    it 'rejects a re-export from another module' do
      expect(rules_for("export { x } from 'react';")).to include 'imports-whitelist'
    end
  end
end
