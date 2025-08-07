export type Notice = {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel?: string;
  timeAgo: string;
  upvotes: number;
  views: number;
  comments: number;
  author: string;
  authorAvatar?: string;
  isAnonymous?: boolean;
  imageUrl?: string;
  distance: string;
  isResolved: boolean;
  hasUpVoted?: boolean;
};
