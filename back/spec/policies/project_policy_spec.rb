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

        it 'does not permit project status update' do
          nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
          expect(nested_permitted_attrs[:admin_publication_attributes].to_a).not_to include(:publication_status)
        end

        context 'and the project is approved' do
          before { create(:project_review, :approved, project: project) }

          it 'permits project status update' do
            nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
            expect(nested_permitted_attrs[:admin_publication_attributes]).to include(:publication_status)
          end
        end
      end

      context 'when the project has been published' do
        before do
          project.admin_publication.update!(first_published_at: Time.current)
        end

        it { is_expected.not_to permit(:destroy) }

        it 'permits project status update' do
          nested_permitted_attrs = policy.permitted_attributes_for_update.find { |attr| attr.is_a?(Hash) }.to_h
          expect(nested_permitted_attrs[:admin_publication_attributes]).to include(:publication_status)
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

        it { is_expected.not_to permit(:create) }
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

          it { is_expected.not_to permit(:destroy) }
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
end
