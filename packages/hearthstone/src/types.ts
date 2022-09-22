export type JSONData = JSONArticle[];

export interface JSONArticle {
  title: string;
  content: string;
  publish: number;
  defaultUrl: string;
}
