'use server';

export async function getFacasterUserByUsername({
  username,
}: {
  username: string;
}) {
  const url = `https://api.neynar.com/v2/farcaster/user/search?q=${username}&limit=1`;
  const options: RequestInit = {
    headers: { accept: 'application/json', api_key: 'NEYNAR_API_DOCS' },
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Neynar: Failed to fetch user by username: ${username}`);
  }

  const data = await response.json();

  return data.result.users[0];
}
