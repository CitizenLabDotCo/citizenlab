# frozen_string_literal: true

require 'rails_helper'

describe AppConfigurationPolicy do
  subject(:policy) { described_class.new(current_user, AppConfiguration.instance) }

  describe '#forbidden_settings' do
    using RSpec::Parameterized::TableSyntax

    let(:current_user) { create(viewer) }
    let(:changed) { [setting.split('.')] }

    where(:viewer, :setting, :permitted) do
      :admin       | 'core.organization_name'             | true
      :admin       | 'flag_inappropriate_content.enabled' | true
      :admin       | 'esri_integration.api_key'           | true
      :admin       | 'esri_integration.allowed'           | false
      :admin       | 'core.maximum_admins_number'         | false
      :admin       | 'core.lifecycle_stage'               | false
      :admin       | 'id_config.id_methods'               | false
      :admin       | 'custom_smtp.address'                | false
      :admin       | 'password_login.enabled'             | false
      :super_admin | 'core.lifecycle_stage'               | true
      :super_admin | 'id_config.id_methods'               | true
    end

    with_them do
      it { expect(policy.forbidden_settings(changed)).to eq(permitted ? [] : changed) }
    end

    context 'when an admin changes allowed and forbidden settings together' do
      let(:current_user) { create(:admin) }

      it 'returns only the forbidden settings of a mixed change' do
        changed = [%w[core organization_name], %w[core lifecycle_stage]]
        expect(policy.forbidden_settings(changed)).to eq [%w[core lifecycle_stage]]
      end
    end
  end
end
