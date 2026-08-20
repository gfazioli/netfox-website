import { useEffect, useState } from 'react';
import { compileMdx } from 'nextra/compile';
import useSWR from 'swr';

export interface Author {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
}

export interface Release {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: Author;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  /** Null on a draft release, which is why every read of it needs a fallback. */
  published_at: string | null;
  /** `published_at` formatted for display. Set by `useReleaseNotes`. */
  displayDate?: string;
  assets: any[];
  tarball_url: string;
  zipball_url: string;
  body: string;
}

export interface TOC {
  value: string;
  depth: string;
  id: string;
}

export function useReleaseNotes() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const [compiledReleases, setCompiledReleases] = useState<Release[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    error: swrError,
    isLoading,
  } = useSWR<{
    releases: Release[];
  }>('/api/github-releases', fetcher);

  useEffect(() => {
    if (data && !isLoading && !error) {
      if (data.toString() === 'rate limit exceeded') {
        setError('Rate limit exceeded. Please try again later. Or check your API key.');
        return;
      }

      const fetchReleases = async () => {
        const releases = await Promise.all(
          data.releases.map(async (release) => ({
            ...release,
            // `published_at`, NOT `created_at`. GitHub reports `created_at` as the
            // date of the *commit the tag points at*, and the release script creates
            // the GitHub Release before it commits the appcast + config — so the tag
            // lands on the previous release's commit and `created_at` is that
            // release's date. v0.16.6 read as August 5 while it shipped on August 20.
            displayDate: new Date(release.published_at ?? release.created_at).toLocaleDateString(
              'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' }
            ),
            body: await compileMdx(release.body),
          }))
        );
        setCompiledReleases(releases);
      };
      fetchReleases();
    }
  }, [data, isLoading, error]); // Add isLoading and error to the dependency array

  return { data: compiledReleases, error: error || swrError, isLoading } as const;
}
