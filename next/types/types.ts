export type Notice = {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel?: string;
  timeAgo: string;
  upvotes: number;
  comments: number;
  author: string;
  authorAvatar?: string;
  isAnonymous?: boolean;
  imageUrl?: string;
  distance: string;
};
