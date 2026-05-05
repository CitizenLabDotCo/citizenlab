# frozen_string_literal: true

require 'rails_helper'

describe ProjectPolicy do
  subject(:policy) { described_class.new(user_context, project) }

  let(:scope) { ProjectPolicy::Scope.new(user_context, Project) }
  let(:inverse_scope) { ProjectPolicy::InverseScope.new(project, User) }
  let(:user_context) { ApplicationPolicy::UserContext.new(user, context) }
  let(:context) { {} }

  context 'on a public timeline project' do
    let!(:project) { create(:single_phase_ideation_project) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)                          }
      it { is_expected.not_to permit(:create)                        }
      it { is_expected.not_to permit(:copy)                          }
      it { is_expected.not_to permit(:update)                        }
      it { is_expected.not_to permit(:reorder)                       }
      it { is_expected.not_to permit(:refresh_preview_token)         }
      it { is_expected.not_to permit(:destroy)                       }
      it { is_expected.not_to permit(:index_xlsx)                    }
      it { is_expected.not_to permit(:votes_by_user_xlsx)            }
      it { is_expected.not_to permit(:votes_by_input_xlsx)           }
      it { is_expected.not_to permit(:publication_recipient_count)   }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.to     permit(:show)                          }
      it { is_expected.not_to permit(:create)                        }
      it { is_expected.not_to permit(:copy)                          }
      it { is_expected.not_to permit(:update)                        }
      it { is_expected.not_to permit(:reorder)                       }
      it { is_expected.not_to permit(:refresh_preview_token)         }
      it { is_expected.not_to permit(:destroy)                       }
      it { is_expected.not_to permit(:index_xlsx)                    }
      it { is_expected.not_to permit(:votes_by_user_xlsx)            }
      it { is_expected.not_to permit(:votes_by_input_xlsx)           }
      it { is_expected.not_to permit(:publication_recipient_count)   }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)                          }
      it { is_expected.to permit(:create)                        }
      it { is_expected.to permit(:copy)                          }
      it { is_expected.to permit(:update)                        }
      it { is_expected.to permit(:reorder)                       }
      it { is_expected.to permit(:refresh_preview_token)         }
      it { is_expected.to permit(:destroy)                       }
      it { is_expected.to permit(:index_xlsx)                    }
      it { is_expected.to permit(:votes_by_user_xlsx)            }
      it { is_expected.to permit(:votes_by_input_xlsx)           }
      it { is_expected.to permit(:publication_recipient_count)   }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end

    context 'for a moderator of the project' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show)                          }
      it { is_expected.not_to permit(:create)                    }
      it { is_expected.to permit(:copy)                          }
      it { is_expected.to permit(:update)                        }
      it { is_expected.to permit(:reorder)                       }
      it { is_expected.to permit(:refresh_preview_token)         }
      it { is_expected.not_to permit(:destroy)                   }
      it { is_expected.to permit(:index_xlsx)                    }
      it { is_expected.to permit(:votes_by_user_xlsx)            }
      it { is_expected.to permit(:votes_by_input_xlsx)           }
      it { is_expected.to permit(:publication_recipient_count)   }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end

    context 'for a moderator of another project' do
      let(:user) { create(:project_moderator, projects: [create(:project)]) }

      it { is_expected.to permit(:show)                              }
      it { is_expected.not_to permit(:create)                        }
      it { is_expected.not_to permit(:copy)                          }
      it { is_expected.not_to permit(:update)                        }
      it { is_expected.not_to permit(:reorder)                       }
      it { is_expected.not_to permit(:refresh_preview_token)         }
      it { is_expected.not_to permit(:destroy)                       }
      it { is_expected.not_to permit(:index_xlsx)                    }
      it { is_expected.not_to permit(:votes_by_user_xlsx)            }
      it { is_expected.not_to permit(:votes_by_input_xlsx)           }
      it { is_expected.not_to permit(:publication_recipient_count)   }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 2
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end
  end

  context 'on a private admins timeline project' do
    let!(:project) { create(:project_with_phases, visible_to: 'admins') }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)                  }
      it { is_expected.not_to permit(:create)                }
      it { is_expected.not_to permit(:update)                }
      it { is_expected.not_to permit(:reorder)               }
      it { is_expected.not_to permit(:refresh_preview_token) }
      it { is_expected.not_to permit(:destroy)               }
      it { is_expected.not_to permit(:index_xlsx)            }
      it { is_expected.not_to permit(:votes_by_user_xlsx)    }
      it { is_expected.not_to permit(:votes_by_input_xlsx)   }

      it 'does not index the project' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)                  }
      it { is_expected.not_to permit(:create)                }
      it { is_expected.not_to permit(:update)                }
      it { is_expected.not_to permit(:reorder)               }
      it { is_expected.not_to permit(:refresh_preview_token) }
      it { is_expected.not_to permit(:destroy)               }
      it { is_expected.not_to permit(:index_xlsx)            }
      it { is_expected.not_to permit(:votes_by_user_xlsx)    }
      it { is_expected.not_to permit(:votes_by_input_xlsx)   }

      it 'does not index the project' do
        expect(scope.resolve.size).to eq 0
      end

      it 'does not include the user in the users that have access' do
        expect(inverse_scope.resolve).not_to include(user)
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)                  }
      it { is_expected.to permit(:create)                }
      it { is_expected.to permit(:update)                }
      it { is_expected.to permit(:reorder)               }
      it { is_expected.to permit(:refresh_preview_token) }
      it { is_expected.to permit(:destroy)               }
      it { is_expected.to permit(:index_xlsx)            }
      it { is_expected.to permit(:votes_by_user_xlsx)    }
      it { is_expected.to permit(:votes_by_input_xlsx)   }

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end
  end

  context 'for a visitor on a private groups project' do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project) }

    it { is_expected.not_to permit(:show)                  }
    it { is_expected.not_to permit(:create)                }
    it { is_expected.not_to permit(:update)                }
    it { is_expected.not_to permit(:reorder)               }
    it { is_expected.not_to permit(:refresh_preview_token) }
    it { is_expected.not_to permit(:destroy)               }
    it { is_expected.not_to permit(:index_xlsx)            }
    it { is_expected.not_to permit(:votes_by_user_xlsx)    }
    it { is_expected.not_to permit(:votes_by_input_xlsx)   }

    it 'does not index the project' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a private groups project where she's no member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project) }

    it { is_expected.not_to permit(:show)                  }
    it { is_expected.not_to permit(:create)                }
    it { is_expected.not_to permit(:update)                }
    it { is_expected.not_to permit(:reorder)               }
    it { is_expected.not_to permit(:refresh_preview_token) }
    it { is_expected.not_to permit(:destroy)               }
    it { is_expected.not_to permit(:index_xlsx)            }
    it { is_expected.not_to permit(:votes_by_user_xlsx)    }
    it { is_expected.not_to permit(:votes_by_input_xlsx)   }

    it 'does not index the project' do
      expect(scope.resolve.size).to eq 0
    end

    it 'does not include the user in the users that have access' do
      expect(inverse_scope.resolve).not_to include(user)
    end

    context 'when a valid preview token is provided' do
      let(:context) { { project_preview_token: project.preview_token } }

      it { is_expected.not_to permit(:show) }

      it 'does not index the project' do
        expect(scope.resolve.size).to eq 0
      end
    end
  end

  context "for a user on a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, user: user, groups_count: 2) }

    it { is_expected.to     permit(:show)                  }
    it { is_expected.not_to permit(:create)                }
    it { is_expected.not_to permit(:update)                }
    it { is_expected.not_to permit(:reorder)               }
    it { is_expected.not_to permit(:refresh_preview_token) }
    it { is_expected.not_to permit(:destroy)               }
    it { is_expected.not_to permit(:index_xlsx)            }
    it { is_expected.not_to permit(:votes_by_user_xlsx)    }
    it { is_expected.not_to permit(:votes_by_input_xlsx)   }

    it 'indexes the project' do
      expect(scope.resolve.size).to eq 1
    end

    it 'includes the user in the users that have access' do
      expect(inverse_scope.resolve).to include(user)
    end
  end

  context 'for an admin on a private groups project' do
    let!(:user) { create(:admin) }
    let!(:project) { create(:private_groups_project) }

    it { is_expected.to permit(:show)                  }
    it { is_expected.to permit(:create)                }
    it { is_expected.to permit(:update)                }
    it { is_expected.to permit(:reorder)               }
    it { is_expected.to permit(:refresh_preview_token) }
    it { is_expected.to permit(:destroy)               }
    it { is_expected.to permit(:index_xlsx)            }
    it { is_expected.to permit(:votes_by_user_xlsx)    }
    it { is_expected.to permit(:votes_by_input_xlsx)   }

    it 'indexes the project' do
      expect(scope.resolve.size).to eq 1
    end

    it 'includes the user in the users that have access' do
      expect(inverse_scope.resolve).to include(user)
    end
  end

  context 'on a draft project' do
    let!(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)                  }
      it { is_expected.not_to permit(:create)                }
      it { is_expected.not_to permit(:update)                }
      it { is_expected.not_to permit(:reorder)               }
      it { is_expected.not_to permit(:refresh_preview_token) }
      it { is_expected.not_to permit(:destroy)               }
      it { is_expected.not_to permit(:index_xlsx)            }
      it { is_expected.not_to permit(:votes_by_user_xlsx)    }
      it { is_expected.not_to permit(:votes_by_input_xlsx)   }

      it 'does not index the project' do
        expect(scope.resolve.size).to eq 0
      end

      context 'when a valid preview token is provided' do
        let(:context) { { project_preview_token: project.preview_token } }

        it { is_expected.to permit(:show) }

        it 'indexes the project' do
          expect(scope.resolve.size).to eq 1
          expect(scope.resolve).to include(project)
        end
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)                  }
      it { is_expected.not_to permit(:create)                }
      it { is_expected.not_to permit(:update)                }
      it { is_expected.not_to permit(:reorder)               }
      it { is_expected.not_to permit(:refresh_preview_token) }
      it { is_expected.not_to permit(:destroy)               }
      it { is_expected.not_to permit(:index_xlsx)            }
      it { is_expected.not_to permit(:votes_by_user_xlsx)    }
      it { is_expected.not_to permit(:votes_by_input_xlsx)   }

      it 'does not index the project' do
        expect(scope.resolve.size).to eq 0
      end

      it 'does not include the user in the users that have access' do
        expect(inverse_scope.resolve).not_to include(user)
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)                  }
      it { is_expected.to permit(:create)                }
      it { is_expected.to permit(:update)                }
      it { is_expected.to permit(:reorder)               }
      it { is_expected.to permit(:refresh_preview_token) }
      it { is_expected.to permit(:destroy)               }
      it { is_expected.to permit(:index_xlsx)            }
      it { is_expected.to permit(:votes_by_user_xlsx)    }
      it { is_expected.to permit(:votes_by_input_xlsx)   }

      it 'permits project status update on a never-published draft project' do
        nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
        expect(nested_permitted_attrs[:admin_publication_attributes]).to include(:publication_status)
      end

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:update)                }
      it { is_expected.to permit(:reorder)               }
      it { is_expected.to permit(:refresh_preview_token) }
      it { is_expected.to permit(:index_xlsx)            }
      it { is_expected.to permit(:votes_by_user_xlsx)    }
      it { is_expected.to permit(:votes_by_input_xlsx)   }

      context 'when the project has never been published' do
        before do
          # Sanity check
          raise 'Project should not have been published' if project.ever_published?
        end

        it { is_expected.to permit(:destroy) }

        it 'does not permit project status update or scheduling' do
          nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
          expect(nested_permitted_attrs[:admin_publication_attributes].to_a)
            .not_to include(:publication_status, :scheduled_status, :scheduled_at)
        end

        context 'and the project is approved' do
          before { create(:project_review, :approved, project: project) }

          it 'permits project status update and scheduling' do
            nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
            expect(nested_permitted_attrs[:admin_publication_attributes])
              .to include(:publication_status, :scheduled_status, :scheduled_at)
          end
        end
      end

      context 'when the project has a due scheduled transition to published' do
        before do
          project.admin_publication.update_columns(
            scheduled_status: 'published', scheduled_at: 1.hour.ago, scheduled_by_id: user.id
          )
        end

        it { is_expected.not_to permit(:destroy) }

        it 'permits project status update and scheduling' do
          nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
          expect(nested_permitted_attrs[:admin_publication_attributes])
            .to include(:publication_status, :scheduled_status, :scheduled_at)
        end
      end

      context 'when the project has been published' do
        before do
          project.admin_publication.update!(first_published_at: Time.current)
        end

        it { is_expected.not_to permit(:destroy) }

        it 'permits project status update and scheduling' do
          nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
          expect(nested_permitted_attrs[:admin_publication_attributes])
            .to include(:publication_status, :scheduled_status, :scheduled_at)
        end
      end

      it 'indexes the project' do
        expect(scope.resolve.size).to eq 1
      end

      it 'includes the user in the users that have access' do
        expect(inverse_scope.resolve).to include(user)
      end
    end

    context 'for a moderator of another project' do
      let(:user) { create(:project_moderator) }

      it { is_expected.not_to permit(:show)                  }
      it { is_expected.to permit(:create)                    }
      it { is_expected.not_to permit(:update)                }
      it { is_expected.not_to permit(:reorder)               }
      it { is_expected.not_to permit(:refresh_preview_token) }
      it { is_expected.not_to permit(:destroy)               }
      it { is_expected.not_to permit(:index_xlsx)            }
      it { is_expected.not_to permit(:votes_by_user_xlsx)    }
      it { is_expected.not_to permit(:votes_by_input_xlsx)   }

      it { expect(scope.resolve).not_to include(project) }
      it { expect(inverse_scope.resolve).not_to include(user) }
    end

    context 'for a project folder moderator' do
      let(:user) { create(:project_folder_moderator) }

      it { is_expected.not_to permit(:show)                  }
      it { is_expected.to permit(:create)                    }
      it { is_expected.not_to permit(:update)                }
      it { is_expected.not_to permit(:reorder)               }
      it { is_expected.not_to permit(:refresh_preview_token) }
      it { is_expected.not_to permit(:destroy)               }
      it { is_expected.not_to permit(:index_xlsx)            }
      it { is_expected.not_to permit(:votes_by_user_xlsx)    }
      it { is_expected.not_to permit(:votes_by_input_xlsx)   }

      it { expect(scope.resolve).not_to include(project) }
      it { expect(inverse_scope.resolve).not_to include(user) }

      it 'does not permit project status update of project outside of moderated folder' do
        nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
        expect(nested_permitted_attrs[:admin_publication_attributes].to_a).not_to include(:publication_status)
      end
    end

    context 'for a space moderator' do
      let(:user) { create(:space_moderator) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.to permit(:create) }
      it { is_expected.not_to permit(:update)                }
      it { is_expected.not_to permit(:reorder)               }
      it { is_expected.not_to permit(:refresh_preview_token) }
      it { is_expected.not_to permit(:destroy)               }
      it { is_expected.not_to permit(:index_xlsx)            }
      it { is_expected.not_to permit(:votes_by_user_xlsx)    }
      it { is_expected.not_to permit(:votes_by_input_xlsx)   }

      it { expect(scope.resolve).not_to include(project) }
      it { expect(inverse_scope.resolve).not_to include(user) }

      it 'permits project status update of project inside of moderated space' do
        project.update!(space: create(:space))
        user.add_role('space_moderator', space_id: project.space.id) # Ensure the user has the role for the project’s space
        nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
        expect(nested_permitted_attrs[:admin_publication_attributes]).to include(:publication_status)
      end

      it 'does not permit project status update of project outside of moderated space' do
        nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
        expect(nested_permitted_attrs[:admin_publication_attributes].to_a).not_to include(:publication_status)
      end
    end

    context "for a moderator of the project's folder" do
      let!(:project_folder) { create(:project_folder) }
      let!(:project) do
        create(
          :project,
          admin_publication_attributes: { publication_status: 'draft', parent_id: project_folder.admin_publication.id }
        )
      end
      let(:user) { create(:project_folder_moderator, project_folders: [project_folder]) }

      it 'permits project status update even when never published and not approved' do
        nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
        expect(nested_permitted_attrs[:admin_publication_attributes]).to include(:publication_status)
      end
    end

    context "for a space moderator whose space contains the project's folder" do
      let!(:space) { create(:space) }
      let!(:project_folder) { create(:project_folder, space: space) }
      let!(:project) do
        create(
          :project,
          space: space,
          admin_publication_attributes: { publication_status: 'draft', parent_id: project_folder.admin_publication.id }
        )
      end
      let(:user) { create(:space_moderator, spaces: [space]) }

      it 'permits project status update even when never published and not approved' do
        nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
        expect(nested_permitted_attrs[:admin_publication_attributes]).to include(:publication_status)
      end
    end
  end

  context 'when folder moderator' do
    let!(:project_folder) { create(:project_folder) }
    let(:user) { build(:project_folder_moderator, project_folders: [project_folder]) }

    context 'for a timeline project contained within a folder the user moderates' do
      let!(:project) { create(:single_phase_ideation_project, admin_publication_attributes: { parent_id: project_folder.admin_publication.id }) }

      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:copy)   }
    end

    context 'for a timeline project not contained within a folder the user moderates' do
      let!(:project) { create(:single_phase_ideation_project) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:copy)   }
    end
  end

  context 'when space moderator' do
    let(:space) { create(:space) }
    let(:other_space) { create(:space) }
    let(:user) { create(:space_moderator, spaces: [space]) }

    context 'for create' do
      context 'when project is created without folder or space id' do
        let(:project) { build(:project, admin_publication_attributes: { publication_status: 'draft' }) }

        it { is_expected.to permit(:create) }
      end

      context 'when project is created with folder id' do
        context 'when folder is in the moderated space' do
          let(:folder) { create(:project_folder, space: space) }
          let(:project) { build(:project, folder: folder, space: nil, admin_publication_attributes: { publication_status: 'draft' }) }

          it { is_expected.to permit(:create) }
        end

        context 'when folder is in a different space' do
          let(:folder) { create(:project_folder, space: other_space) }
          let(:project) { build(:project, folder: folder, space: nil, admin_publication_attributes: { publication_status: 'draft' }) }

          it { is_expected.not_to permit(:create) }
        end

        context 'when folder is in a different space but user is also a folder moderator of that folder' do
          let(:folder) { create(:project_folder, space: other_space) }
          let(:user) { create(:space_moderator, spaces: [space]).tap { |u| u.add_role('project_folder_moderator', project_folder_id: folder.id) } }
          let(:project) { build(:project, folder: folder, space: nil, admin_publication_attributes: { publication_status: 'draft' }) }

          it { is_expected.to permit(:create) }
        end

        context 'when folder has no space assigned' do
          let(:folder) { create(:project_folder, space: nil) }
          let(:project) { build(:project, folder: folder, space: nil, admin_publication_attributes: { publication_status: 'draft' }) }

          it { is_expected.not_to permit(:create) }
        end
      end

      context 'when project is created with space id' do
        context 'when user moderates that space' do
          let(:project) { build(:project, space: space, admin_publication_attributes: { publication_status: 'draft' }) }

          it { is_expected.to permit(:create) }
        end

        context 'when user moderates a different space' do
          let(:project) { build(:project, space: other_space, admin_publication_attributes: { publication_status: 'draft' }) }

          it { is_expected.not_to permit(:create) }
        end
      end
    end

    context 'for show, update, and destroy' do
      context 'when project is in the moderated space' do
        let(:project) { create(:project, space: space) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:update) }
        it { is_expected.to permit(:copy) }

        context 'when project has never been published' do
          before do
            project.admin_publication.update!(publication_status: 'draft', first_published_at: nil)
          end

          it { is_expected.to permit(:destroy) }
        end

        context 'when project has been published' do
          before do
            project.admin_publication.update!(first_published_at: Time.current)
          end

          it { is_expected.to permit(:destroy) }
        end
      end

      context 'when project is in a space the user cannot moderate' do
        let(:project) { create(:project, space: other_space) }

        it { is_expected.to permit(:show) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:copy) }
        it { is_expected.not_to permit(:destroy) }
      end

      context 'when project is in a folder within the moderated space' do
        let(:folder) { create(:project_folder, space: space) }
        let(:project) { create(:project, space: space, admin_publication_attributes: { parent_id: folder.admin_publication.id }) }

        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:update) }
        it { is_expected.to permit(:copy) }
      end

      context 'when project is in a folder in a space user cannot moderate' do
        let(:folder) { create(:project_folder, space: other_space) }
        let(:project) { create(:project, space: other_space, admin_publication_attributes: { parent_id: folder.admin_publication.id }) }

        it { is_expected.to permit(:show) }
        it { is_expected.not_to permit(:update) }
        it { is_expected.not_to permit(:copy) }
        it { is_expected.not_to permit(:destroy) }
      end
    end
  end

  describe '#update? folder movement rules' do
    # The controller assigns params (including folder_id) before calling `authorize`,
    # so when Project#folder_id= runs it flips `folder_changed?` to true and points
    # `project.folder` at the new target. These tests simulate that by assigning
    # folder_id in-memory right before asking the policy. The controller also passes
    # the pre-mutation project state via `policy_context[:prior_record]`; we mirror
    # that here by reloading from the DB at policy-check time.
    let(:context) { { prior_record: Project.find(project.id) } }

    let!(:source_folder) { create(:project_folder) }
    let!(:target_folder) { create(:project_folder) }
    let!(:project) do
      create(
        :project,
        admin_publication_attributes: {
          parent_id: source_folder.admin_publication.id,
          publication_status: 'draft'
        }
      )
    end

    def mark_as_published
      project.admin_publication.update!(first_published_at: Time.current)
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it 'permits moving to another folder' do
        project.folder_id = target_folder.id
        is_expected.to permit(:update)
      end

      it 'permits removing the project from its folder' do
        project.folder_id = nil
        is_expected.to permit(:update)
      end
    end

    context 'for a folder moderator of the source folder only' do
      let(:user) { create(:project_folder_moderator, project_folders: [source_folder]) }

      it 'denies moving to a folder the user does not moderate' do
        project.folder_id = target_folder.id
        is_expected.not_to permit(:update)
      end

      it 'denies removing the project from its folder' do
        project.folder_id = nil
        is_expected.not_to permit(:update)
      end
    end

    context 'for a folder moderator of both source and target folders' do
      let(:user) { create(:project_folder_moderator, project_folders: [source_folder, target_folder]) }

      it 'permits moving to the target folder' do
        project.folder_id = target_folder.id
        is_expected.to permit(:update)
      end

      it 'permits moving to the target folder even when the project has been published' do
        mark_as_published
        project.folder_id = target_folder.id
        is_expected.to permit(:update)
      end
    end

    context 'for a space moderator whose space contains the project' do
      let!(:space) { create(:space) }
      let!(:source_folder) { create(:project_folder, space: space) }
      let!(:target_folder) { create(:project_folder, space: space) }
      let!(:project) do
        create(
          :project,
          space: space,
          admin_publication_attributes: {
            parent_id: source_folder.admin_publication.id,
            publication_status: 'draft'
          }
        )
      end
      let(:user) { create(:space_moderator, spaces: [space]) }

      it 'permits moving to another folder in the same space' do
        project.folder_id = target_folder.id
        is_expected.to permit(:update)
      end

      it 'denies removing the project from its folder' do
        project.folder_id = nil
        is_expected.to permit(:update)
      end
    end

    context 'for a space moderator removing the project from its folder (project and folder both in the moderated space)' do
      let!(:space) { create(:space) }
      let!(:other_managed_space) { create(:space) }
      let!(:unmanaged_space) { create(:space) }
      let!(:source_folder) { create(:project_folder, space: space) }
      let!(:project) do
        create(
          :project,
          space: space,
          admin_publication_attributes: {
            parent_id: source_folder.admin_publication.id,
            publication_status: 'draft'
          }
        )
      end

      context 'when the SM moderates only the project space' do
        let(:user) { create(:space_moderator, spaces: [space]) }

        it 'permits removing the project from its folder (keeping it in the same space)' do
          project.folder_id = nil
          is_expected.to permit(:update)
        end

        it 'denies moving the project out of the folder and into a space the SM does not moderate' do
          project.folder_id = nil
          project.space_id = unmanaged_space.id
          is_expected.not_to permit(:update)
        end

        it 'denies moving the project out of the folder and to no space' do
          project.folder_id = nil
          project.space_id = nil
          is_expected.not_to permit(:update)
        end
      end

      context 'when the SM also moderates another space' do
        let(:user) { create(:space_moderator, spaces: [space, other_managed_space]) }

        it 'permits moving the project out of the folder and into the other moderated space' do
          project.folder_id = nil
          project.space_id = other_managed_space.id
          is_expected.to permit(:update)
        end
      end
    end

    context 'for a space moderator of a different space' do
      let!(:other_space) { create(:space) }
      let(:user) { create(:space_moderator, spaces: [other_space]) }

      it 'denies any folder change (user is not a moderator of the project)' do
        project.folder_id = target_folder.id
        is_expected.not_to permit(:update)
      end
    end

    context 'when moving into a folder in a different space (space change is a side-effect of Project#folder_id=)' do
      let!(:project_space) { create(:space) }
      let!(:other_space) { create(:space) }
      let!(:target_folder) { create(:project_folder, space: other_space) }
      let!(:project) do
        create(
          :project,
          space: project_space,
          admin_publication_attributes: { publication_status: 'draft' }
        )
      end

      context 'for a user moderating both the project space and the target space' do
        let(:user) { create(:space_moderator, spaces: [project_space, other_space]) }

        it 'permits the folder move' do
          project.folder_id = target_folder.id
          is_expected.to permit(:update)
        end
      end

      context 'for a folder moderator of the target folder who already moderates the project (via a source folder)' do
        let!(:source_folder) { create(:project_folder, space: project_space) }
        let!(:project) do
          create(
            :project,
            space: project_space,
            admin_publication_attributes: {
              parent_id: source_folder.admin_publication.id,
              publication_status: 'draft'
            }
          )
        end
        let(:user) { create(:project_folder_moderator, project_folders: [source_folder, target_folder]) }

        it 'permits the folder move — FM moderates the project both before and after' do
          project.folder_id = target_folder.id
          is_expected.to permit(:update)
        end
      end

      context 'for a folder moderator of the target folder with no prior moderation of the project' do
        let(:user) { create(:project_folder_moderator, project_folders: [target_folder]) }

        it 'denies the folder move — FM must moderate the project before the change, not only after' do
          project.folder_id = target_folder.id
          is_expected.not_to permit(:update)
        end
      end
    end
  end

  describe '#update? space movement rules' do
    # space_id is a real column on Project, so ActiveModel's dirty tracking
    # provides space_changed? out of the box. The controller assigns params
    # (including space_id) before calling `authorize`; these tests simulate
    # that by assigning space_id in-memory right before asking the policy. The
    # controller also passes the pre-mutation project state via
    # `policy_context[:prior_record]`; we mirror that here by reloading from
    # the DB at policy-check time.
    let(:context) { { prior_record: Project.find(project.id) } }

    let!(:project_space) { create(:space) }
    let!(:other_space) { create(:space) }
    let!(:project) do
      create(
        :project,
        space: project_space,
        admin_publication_attributes: { publication_status: 'draft' }
      )
    end

    def mark_as_published
      project.admin_publication.update!(first_published_at: Time.current)
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it 'permits moving to another space' do
        project.space_id = other_space.id
        is_expected.to permit(:update)
      end

      it 'permits removing the project from its space' do
        project.space_id = nil
        is_expected.to permit(:update)
      end
    end

    context 'for a space moderator of the project space only' do
      let(:user) { create(:space_moderator, spaces: [project_space]) }

      it 'denies moving to a space the user does not moderate' do
        project.space_id = other_space.id
        is_expected.not_to permit(:update)
      end

      it 'denies removing the project from its space' do
        project.space_id = nil
        is_expected.not_to permit(:update)
      end
    end

    context 'for a space moderator of both the project space and another space' do
      let(:user) { create(:space_moderator, spaces: [project_space, other_space]) }

      it 'permits moving to the other moderated space' do
        project.space_id = other_space.id
        is_expected.to permit(:update)
      end

      it 'permits moving to the other moderated space even when the project has been published' do
        mark_as_published
        project.space_id = other_space.id
        is_expected.to permit(:update)
      end
    end

    context 'for a space moderator of a different space only' do
      let(:user) { create(:space_moderator, spaces: [other_space]) }

      it 'denies any space change (user is not a moderator of the project)' do
        project.space_id = nil
        is_expected.not_to permit(:update)
      end
    end
  end

  describe '#shared_permitted_attributes' do
    let(:project) { create(:project) }

    shared_examples 'permits folder_id' do
      it 'includes folder_id' do
        expect(policy.shared_permitted_attributes.flatten).to include(:folder_id)
      end
    end

    shared_examples 'does not permit folder_id' do
      it 'does not include folder_id' do
        expect(policy.shared_permitted_attributes.flatten).not_to include(:folder_id)
      end
    end

    shared_examples 'permits space_id' do
      it 'includes space_id' do
        expect(policy.shared_permitted_attributes.flatten).to include(:space_id)
      end
    end

    shared_examples 'does not permit space_id' do
      it 'does not include space_id' do
        expect(policy.shared_permitted_attributes.flatten).not_to include(:space_id)
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it_behaves_like 'permits folder_id'
      it_behaves_like 'permits space_id'
    end

    context 'for a space moderator' do
      let(:user) { create(:space_moderator) }

      it_behaves_like 'permits folder_id'
      it_behaves_like 'permits space_id'
    end

    context 'for a project folder moderator' do
      let(:user) { create(:project_folder_moderator) }

      it_behaves_like 'permits folder_id'
      it_behaves_like 'does not permit space_id'
    end

    context 'for a project moderator' do
      let(:user) { create(:project_moderator) }

      it_behaves_like 'does not permit folder_id'
      it_behaves_like 'does not permit space_id'
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it_behaves_like 'does not permit folder_id'
      it_behaves_like 'does not permit space_id'
    end

    context 'for a visitor' do
      let(:user) { nil }

      it_behaves_like 'does not permit folder_id'
      it_behaves_like 'does not permit space_id'
    end
  end
end
