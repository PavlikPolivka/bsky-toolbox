
const REGEXP = /^at:\/\/([a-z0-9:%-]+)\/([a-z0-9:%.-]+)\/([a-z0-9:%-]+)$/i;


export class AtUri {

  public collection: string = '';
  public repo: string = '';
  public rkey: string = '';

  // at://did:plc:mozqqiaodbvfpbghqk5pjw2y/app.bsky.graph.follow/3lchpiizber2f
  // collection: app.bsky.graph.follow
  // repo: did:plc:mozqqiaodbvfpbghqk5pjw2y
  // rkey: 3lchpiizber2f
  constructor(
    public uri: string
  ) {

    const matches = REGEXP.exec(uri);
    if (matches) {
      this.collection = matches[2] ?? '';
      this.repo = matches[1] ?? '';
      this.rkey = matches[3] ?? '';
    }

  }

}
