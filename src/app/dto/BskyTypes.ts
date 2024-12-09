
export interface BSkyLogin {
  handle: string;
  accessJwt: string;
  refreshJwt: string;
}

export interface BSkyFollows {
  cursor?: string;
  follows: BSkyFollow[];
}

export interface BSkyFollow {
  handle: string;
  viewer: BSkyViewer;
}

export interface BSkyViewer {
  following: string;
}

export interface BSkyFeed {
  feed: BSkyFeedItem[];
  cursor?: string;
}

export interface BSkyFeedItem {
  post: BSkyPost;
}

export interface BSkyPost {
  author: BSkyAuthor;
  indexedAt: Date;
}

export interface BSkyAuthor {
  handle: string;
}

export interface RichFollow {
  follow: BSkyFollow;
  feed: BSkyFeed;
}
