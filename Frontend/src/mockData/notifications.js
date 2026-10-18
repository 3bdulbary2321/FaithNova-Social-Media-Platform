export const mockNotifications = [
  {
    id: 'notif-1',
    type: 'citation',
    actor: {
      name: 'Prof. Amina El-Khatib',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    },
    actionText: 'cited your paper in',
    targetTitle: 'Entropy, Biological Organization, and Teleological Order',
    time: '12m ago',
    isUnread: true,
  },
  {
    id: 'notif-2',
    type: 'reply',
    actor: {
      name: 'Dr. Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    actionText: 'replied to your discussion on',
    targetTitle: 'Singularity theorems and cosmological exegesis',
    time: '45m ago',
    isUnread: true,
  },
  {
    id: 'notif-3',
    type: 'peer_review',
    actor: {
      name: 'Editorial Board',
      avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&auto=format&fit=crop&q=80',
    },
    actionText: 'approved your peer review for',
    targetTitle: 'Quantum Indeterminacy in Ash\'arite Metaphysics',
    time: '2h ago',
    isUnread: true,
  },
  {
    id: 'notif-4',
    type: 'upvote',
    actor: {
      name: 'Dr. Sarah Chen-Davies',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    },
    actionText: 'endorsed your hypothesis on',
    targetTitle: 'Circadian gene expression and dawn contemplation',
    time: '5h ago',
    isUnread: false,
  },
];
