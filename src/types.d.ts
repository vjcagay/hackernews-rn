type StoryType = "top" | "new" | "best" | "ask" | "show" | "job";

type ItemType = "job" | "story" | "comment" | "poll" | "pollopt";

type Story = {
  id: number;
  deleted: boolean;
  type: ItemType;
  by: string;
  text: string;
  dead: boolean;
  parent: number;
  poll: number;
  kids: number[];
  url: URL;
  score: number;
  title: string;
  parts: number[];
  descendants: number;
};

type Stories = number[];

type User = {
  id: string;
  created: number;
  karma: number;
  about: string;
  submitted: number[];
};
