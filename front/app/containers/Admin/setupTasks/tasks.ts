// prototype data — hardcoded checklist, nothing is loaded from the back end.
// A real version would derive `done` from the platform's actual configuration.

export type SetupTask = {
  id: string;
  title: string;
  description: string;
  // Where the "Set up" button takes the admin.
  link: string;
  // Rough time investment, shown as a hint next to the task.
  duration: string;
  // Required tasks are needed before the platform can go live.
  required: boolean;
  // Whether we consider this task already taken care of.
  done: boolean;
};

export type SetupSection = {
  id: string;
  title: string;
  subtitle: string;
  tasks: SetupTask[];
};

const setupSections: SetupSection[] = [
  {
    id: 'basics',
    title: 'Make it yours',
    subtitle: 'Give the platform your name, your look and your languages.',
    tasks: [
      {
        id: 'platform-name',
        title: 'Name your platform',
        description:
          'The name citizens see in the tab, in emails and in search results.',
        link: '/admin/settings/general',
        duration: '2 min',
        required: true,
        done: true,
      },
      {
        id: 'branding',
        title: 'Add your logo and colours',
        description:
          'Upload your logo and pick the colours used across the platform.',
        link: '/admin/settings/customize',
        duration: '10 min',
        required: true,
        done: true,
      },
      {
        id: 'languages',
        title: 'Choose your languages',
        description:
          'Pick the languages residents can switch between on the platform.',
        link: '/admin/settings/general',
        duration: '3 min',
        required: true,
        done: false,
      },
      {
        id: 'homepage',
        title: 'Set up your homepage',
        description:
          'Write a welcoming message and decide which sections appear first.',
        link: '/admin/pages-menu',
        duration: '20 min',
        required: false,
        done: false,
      },
    ],
  },
  {
    id: 'participation',
    title: 'Open your first project',
    subtitle: 'Give people something to take part in.',
    tasks: [
      {
        id: 'first-project',
        title: 'Create your first project',
        description:
          'Start from a template or build a project from scratch in a few steps.',
        link: '/admin/projects',
        duration: '30 min',
        required: true,
        done: false,
      },
      {
        id: 'phases',
        title: 'Plan the timeline',
        description:
          'Decide which phases your project runs through and when each one ends.',
        link: '/admin/projects',
        duration: '15 min',
        required: false,
        done: false,
      },
      {
        id: 'permissions',
        title: 'Decide who can take part',
        description:
          'Everyone, registered users only, or a specific group of residents.',
        link: '/admin/projects',
        duration: '10 min',
        required: true,
        done: false,
      },
      {
        id: 'topics',
        title: 'Set up your topics',
        description:
          'The themes people use to label and filter their contributions.',
        link: '/admin/settings/topics',
        duration: '5 min',
        required: false,
        done: false,
      },
    ],
  },
  {
    id: 'team',
    title: 'Bring your team on board',
    subtitle: 'Share the work of running the platform.',
    tasks: [
      {
        id: 'invite-admins',
        title: 'Invite your colleagues',
        description:
          'Send invitations to the people who will manage projects with you.',
        link: '/admin/invitations',
        duration: '5 min',
        required: false,
        done: false,
      },
      {
        id: 'registration',
        title: 'Tune the sign-up form',
        description:
          'Ask only what you need, so signing up stays a short step.',
        link: '/admin/settings/registration',
        duration: '15 min',
        required: false,
        done: false,
      },
    ],
  },
  {
    id: 'launch',
    title: 'Go live',
    subtitle: 'The last checks before you tell the world.',
    tasks: [
      {
        id: 'policies',
        title: 'Review your privacy policy and terms',
        description:
          'Check the default texts and adjust them to your organisation.',
        link: '/admin/settings/policies',
        duration: '20 min',
        required: true,
        done: false,
      },
      {
        id: 'test-run',
        title: 'Do a test run as a resident',
        description:
          'Sign up, post something and vote, to see the platform as they will.',
        link: '/',
        duration: '15 min',
        required: false,
        done: false,
      },
      {
        id: 'announce',
        title: 'Announce your platform',
        description:
          'Email your mailing list and share the link on your channels.',
        link: '/admin/messaging',
        duration: '30 min',
        required: false,
        done: false,
      },
    ],
  },
];

export default setupSections;
