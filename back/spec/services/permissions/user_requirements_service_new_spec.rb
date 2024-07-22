# frozen_string_literal: true

require 'rails_helper'

describe Permissions::UserRequirementsService do
  let(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
    SettingsService.new.activate_feature! 'custom_permitted_by'
  end

  describe '#requirements' do
    before do
      create(:custom_field_birthyear, required: true)
      create(:custom_field_gender, required: false)
      create(:custom_field_checkbox, resource_type: 'User', required: true, key: 'extra_required_field')
      create(:custom_field_number, resource_type: 'User', required: false, key: 'extra_optional_field')
    end

    let(:user) do
      create(
        :user,
        first_name: 'Jane',
        last_name: 'Jacobs',
        email: 'jane@jacobs.com',
        custom_field_values: {
          'gender' => 'female',
          'birthyear' => 1975,
          'extra_required_field' => false,
          'extra_optional_field' => 29
        },
        password: 'supersecret',
        email_confirmed_at: Time.now
      )
    end

    context 'when onboarding is possible (there are topics and areas assigned to projects)' do
      before { create(:topic, include_in_onboarding: true) }

      context 'when permitted_by is set to everyone' do
        let(:permission) { create(:permission, permitted_by: 'everyone', global_custom_fields: false) }

        it 'permits a visitor' do
          expect(service.requirements(permission, nil)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'dont_ask',
                last_name: 'dont_ask',
                email: 'dont_ask'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'dont_ask',
                confirmation: 'dont_ask',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a light unconfirmed resident' do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'dont_ask',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'dont_ask',
                confirmation: 'dont_ask',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a fully registered confirmed resident' do
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end
      end

      context 'when permitted_by is set to everyone_confirmed_email' do
        let(:permission) { create(:permission, permitted_by: 'everyone_confirmed_email', global_custom_fields: true) }

        it 'does not permit a visitor' do
          expect(service.requirements(permission, nil)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'dont_ask',
                last_name: 'dont_ask',
                email: 'require'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'dont_ask',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit a light unconfirmed resident' do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'dont_ask',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'dont_ask',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a light confirmed resident' do
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'dont_ask',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'dont_ask',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit a fully registered unconfirmed resident' do # https://citizenlabco.slack.com/archives/C04FX2ATE5B/p1677170928400679
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a fully registered confirmed resident' do
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit an unconfirmed admin' do
          user.add_role 'admin'
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {},
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end
      end

      context 'when permitted_by is set to users' do
        let(:permission) { create(:permission, permitted_by: 'users', global_custom_fields: true) }

        it 'does not permit a visitor' do
          expect(service.requirements(permission, nil)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'require',
                last_name: 'require',
                email: 'require'
              },
              custom_fields: {
                'birthyear' => 'require',
                'gender' => 'ask',
                'extra_required_field' => 'require',
                'extra_optional_field' => 'ask'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'require',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit a light confirmed resident' do
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'require',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'require',
                'gender' => 'ask',
                'extra_required_field' => 'require',
                'extra_optional_field' => 'ask'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'require',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit a fully registered unconfirmed resident' do
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a fully registered confirmed resident' do
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not ask onboarding for a fully registered confirmed resident when onboarding is not possible' do
          app_configuration = AppConfiguration.instance
          app_configuration.settings['core']['onboarding'] = false
          app_configuration.save!

          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit an unconfirmed admin' do
          user.add_role 'admin'
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'require',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end
      end

      context 'when permitted_by is set to custom' do
        context 'groups' do
          let(:group) { create(:group) }
          let(:permission) { create(:permission, permitted_by: 'custom', groups: [group], global_custom_fields: false) }

          before do
            Permissions::PermissionsFieldsService.new.persist_default_fields(
              permission: permission,
              previous_permitted_by: 'everyone_confirmed_email'
            )
          end

          context 'user is not in the permission group' do
            before do
              field = CustomField.find_by code: 'birthyear'
              create(:permissions_field, permission: permission, custom_field: field, required: true)
            end

            it 'does not permit a visitor' do
              expect(service.requirements(permission, nil)).to eq({
                permitted: false,
                requirements: {
                  built_in: {
                    first_name: 'dont_ask',
                    last_name: 'dont_ask',
                    email: 'require'
                  },
                  custom_fields: {
                    'birthyear' => 'require'
                  },
                  onboarding: { topics_and_areas: 'dont_ask' },
                  special: {
                    password: 'dont_ask',
                    confirmation: 'require',
                    verification: 'dont_ask',
                    group_membership: 'require'
                  }
                }
              })
            end

            it 'does not permit a light unconfirmed resident' do
              user.reset_confirmation_and_counts
              user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: { 'birthyear' => 1968 })
              expect(service.requirements(permission, user)).to eq({
                permitted: false,
                requirements: {
                  built_in: {
                    first_name: 'dont_ask',
                    last_name: 'satisfied',
                    email: 'satisfied'
                  },
                  custom_fields: {
                    'birthyear' => 'satisfied'
                  },
                  onboarding: { topics_and_areas: 'dont_ask' },
                  special: {
                    password: 'dont_ask',
                    confirmation: 'require',
                    verification: 'dont_ask',
                    group_membership: 'require'
                  }
                }
              })
            end

            it 'does not permit a fully registered confirmed resident' do
              expect(service.requirements(permission, user)).to eq({
                permitted: false,
                requirements: {
                  built_in: {
                    first_name: 'satisfied',
                    last_name: 'satisfied',
                    email: 'satisfied'
                  },
                  custom_fields: {
                    'birthyear' => 'satisfied'
                  },
                  onboarding: { topics_and_areas: 'dont_ask' },
                  special: {
                    password: 'satisfied',
                    confirmation: 'satisfied',
                    verification: 'dont_ask',
                    group_membership: 'require'
                  }
                }
              })
            end

            it 'does not permit an unconfirmed admin' do
              user.add_role 'admin'
              user.reset_confirmation_and_counts
              expect(service.requirements(permission, user)).to eq({
                permitted: false,
                requirements: {
                  built_in: {
                    first_name: 'satisfied',
                    last_name: 'satisfied',
                    email: 'satisfied'
                  },
                  custom_fields: {
                    'birthyear' => 'satisfied'
                  },
                  onboarding: { topics_and_areas: 'dont_ask' },
                  special: {
                    password: 'satisfied',
                    confirmation: 'require',
                    verification: 'dont_ask',
                    group_membership: 'require'
                  }
                }
              })
            end

            it 'does not permit a confirmed admin' do
              user.add_role 'admin'
              expect(service.requirements(permission, user)).to eq({
                permitted: false,
                requirements: {
                  built_in: {
                    first_name: 'satisfied',
                    last_name: 'satisfied',
                    email: 'satisfied'
                  },
                  custom_fields: {
                    'birthyear' => 'satisfied'
                  },
                  onboarding: { topics_and_areas: 'dont_ask' },
                  special: {
                    password: 'satisfied',
                    confirmation: 'satisfied',
                    verification: 'dont_ask',
                    group_membership: 'require'
                  }
                }
              })
            end
          end

          context 'user is in the group' do
            before { create(:membership, user: user, group: group) }

            it 'permits a fully registered confirmed resident who is in the group' do
              expect(service.requirements(permission, user)).to eq({
                permitted: true,
                requirements: {
                  built_in: {
                    first_name: 'satisfied',
                    last_name: 'satisfied',
                    email: 'satisfied'
                  },
                  custom_fields: {},
                  onboarding: { topics_and_areas: 'dont_ask' },
                  special: {
                    password: 'satisfied',
                    confirmation: 'satisfied',
                    verification: 'dont_ask',
                    group_membership: 'satisfied'
                  }
                }
              })
            end
          end
        end

        context 'nothing is enabled' do
          before do
            create(:permissions_field, field_type: 'email', permission: permission, required: false, enabled: false, config: { password: false, confirmed: false })
            create(:permissions_field, field_type: 'name', permission: permission, required: false, enabled: false)
            field = CustomField.find_by code: 'birthyear'
            create(:permissions_field, permission: permission, custom_field: field, required: true)
          end

          let(:permission) { create(:permission, permitted_by: 'custom') }
          let(:user) { create(:user_with_confirmation, unique_code: '123', first_name: nil, last_name: nil, password: nil, email: nil) }

          it 'does not permit a user when only single custom field is required' do
            expect(service.requirements(permission, user)).to eq({
              permitted: false,
              requirements: {
                built_in: {
                  first_name: 'dont_ask',
                  last_name: 'dont_ask',
                  email: 'dont_ask'
                },
                custom_fields: {
                  'birthyear' => 'require'
                },
                onboarding: { topics_and_areas: 'dont_ask' },
                special: {
                  password: 'dont_ask',
                  confirmation: 'dont_ask',
                  verification: 'dont_ask',
                  group_membership: 'dont_ask'
                }
              }
            })
          end

          it 'permits a user who has only completed a single custom field is required' do
            user.update!(custom_field_values: { 'birthyear' => 1975 })
            expect(service.requirements(permission, user)).to eq({
              permitted: true,
              requirements: {
                built_in: {
                  first_name: 'dont_ask',
                  last_name: 'dont_ask',
                  email: 'dont_ask'
                },
                custom_fields: {
                  'birthyear' => 'satisfied'
                },
                onboarding: { topics_and_areas: 'dont_ask' },
                special: {
                  password: 'dont_ask',
                  confirmation: 'dont_ask',
                  verification: 'dont_ask',
                  group_membership: 'dont_ask'
                }
              }
            })
          end
        end
      end

      context 'when permitted_by is set to admins_moderators' do
        let(:permission) { create(:permission, permitted_by: 'admins_moderators', global_custom_fields: false) }

        before { SettingsService.new.deactivate_feature! 'user_confirmation' }

        it 'does not permit a visitor' do
          expect(service.requirements(permission, nil)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'require',
                last_name: 'require',
                email: 'require'
              },
              custom_fields: {
                'birthyear' => 'require',
                'gender' => 'ask',
                'extra_required_field' => 'require',
                'extra_optional_field' => 'ask'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'require',
                confirmation: 'dont_ask',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'does not permit a light unconfirmed resident' do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
          expect(service.requirements(permission, user)).to eq({
            permitted: false,
            requirements: {
              built_in: {
                first_name: 'require',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'require',
                'gender' => 'ask',
                'extra_required_field' => 'require',
                'extra_optional_field' => 'ask'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'require',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a fully registered unconfirmed resident' do
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits an unconfirmed admin' do
          user.add_role 'admin'
          user.reset_confirmation_and_counts
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end

        it 'permits a confirmed admin' do
          user.add_role 'admin'
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end
      end
    end

    context 'when onboarding is not possible (there are no topics or areas assigned to projects)' do
      context 'when permitted_by is set to "custom" from "users"' do
        let(:permission) { create(:permission, permitted_by: 'custom', global_custom_fields: true) }

        before do
          Permissions::PermissionsFieldsService.new.persist_default_fields(permission: permission, previous_permitted_by: 'users')
        end

        it 'permits a fully registered confirmed resident' do
          expect(service.requirements(permission, user)).to eq({
            permitted: true,
            requirements: {
              built_in: {
                first_name: 'satisfied',
                last_name: 'satisfied',
                email: 'satisfied'
              },
              custom_fields: {
                'birthyear' => 'satisfied',
                'gender' => 'satisfied',
                'extra_required_field' => 'satisfied',
                'extra_optional_field' => 'satisfied'
              },
              onboarding: { topics_and_areas: 'dont_ask' },
              special: {
                password: 'satisfied',
                confirmation: 'satisfied',
                verification: 'dont_ask',
                group_membership: 'dont_ask'
              }
            }
          })
        end
      end
    end
  end

  describe '#requirements_fields' do
    let(:permission) { create(:permission, permitted_by: 'custom') }

    before do
      create(:custom_field_gender, enabled: true, required: false)
      Permissions::PermissionsFieldsService.new.persist_default_fields(
        permission: permission,
        previous_permitted_by: 'user'
      )
    end

    it 'returns only custom fields' do
      fields = service.requirements_custom_fields(permission)
      expect(fields.count).to eq 1
      expect(fields.first.class.name).to eq 'CustomField'
      expect(fields.first.key).to eq 'gender'
      expect(fields.first.required).to be false
    end

    it 'returns required values of the permission field' do
      custom_field_id = CustomField.find_by(code: 'gender').id
      permissions_field = PermissionsField.find_by(custom_field_id: custom_field_id, permission: permission)
      permissions_field.update!(required: true)

      fields = service.requirements_custom_fields(permission)
      expect(fields.count).to eq 1
      expect(fields.first.class.name).to eq 'CustomField'
      expect(fields.first.key).to eq 'gender'
      expect(fields.first.required).to be true
    end
  end
end
