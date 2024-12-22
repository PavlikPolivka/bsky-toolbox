
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

export interface BSkyStarterPackResponse {
  starterPack: BSkyStarterPack;
}

export interface BSkyStarterPack {
  record: BSkyRecord;
  list: BSkyList;
}

export interface BSkyRecord {
  name: string;
  description: string;
}

export interface BSkyList {
  uri: string;
}

export interface BSkyListResponse {
  list: BSkyList;
  items: BSkyItem[];
  cursor?: string;
}

export interface BSkyItem {
  uri: string;
  subject: BSkySubject;
}

export interface BSkySubject {
  did: string;
  handle: string;
  viewer: BSkyViewer;
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
