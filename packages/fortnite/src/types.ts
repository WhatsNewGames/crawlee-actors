/**
 * Only interesting fields are typed
 */
export interface JSONData {
  blogList: JSONBlogPost[];
}

export interface JSONBlogPost {
  title: string;
  date: string;
  content: string;
  slug: string;
}
