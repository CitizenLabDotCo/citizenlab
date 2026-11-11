# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BaseFileUploader do
  describe '.download_only?' do
    using RSpec::Parameterized::TableSyntax

    where(:content_type, :download_only) do
      'application/xml'                                                   | true
      'text/xml'                                                          | true
      'application/vnd.google-earth.kml+xml'                              | true
      'image/svg+xml'                                                     | true
      'text/xml; charset=utf-8'                                           | true
      'Application/XML'                                                   | true
      'application/pdf'                                                   | false
      'text/csv'                                                          | false
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' | false
      nil                                                                 | false
    end

    with_them do
      it { expect(described_class.download_only?(content_type)).to be(download_only) }
    end
  end
end
