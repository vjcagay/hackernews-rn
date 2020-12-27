const baseUrl = "https://hacker-news.firebaseio.com/v0";

const endpoints = {
  top: `${baseUrl}/topstories.json`,
  new: `${baseUrl}/newstories.json`,
  best: `${baseUrl}/beststories.json`,
  ask: `${baseUrl}/askstories.json`,
  show: `${baseUrl}/showstories.json`,
  job: `${baseUrl}/jobstories.json`,
  updates: `${baseUrl}/updates.json`,
  maxItem: `${baseUrl}/maxitem.json`,
};

const getStoryById = async (id: number): Promise<Story> => {
  const result = await fetch(`${baseUrl}/item/${id}.json`);
  return await result.json();
};

export default endpoints;
export { getStoryById };
