import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Flex, Stack, Text } from '@sanity/ui';
import { Icon } from '@sanity/icons';

// This @sanity/icons version dropped per-icon named exports (the old names
// remain only as deprecated type tombstones, which is why the build passed
// while hydration failed); icons render via <Icon symbol="...">.
const PublishIcon = () => <Icon symbol="rocket" />;
import type { Tool } from 'sanity';

/**
 * "Update website" Studio tool: a self-service publish button for the
 * secretary. POSTs a Netlify build hook (separate from the content webhook,
 * which may be off) and shows the site's live deploy status badge so she can
 * watch the build finish instead of refreshing and wondering.
 *
 * Both identifiers below are public by accepted tradeoff (2026-08-05): the
 * hook URL lands in the Studio bundle either way, the worst an abuser can do
 * is burn build minutes, and the remedy is deleting the hook in Netlify and
 * creating a new one.
 */
const BUILD_HOOK = 'https://api.netlify.com/build_hooks/6a86583fc67254578ccd2693';
const SITE_ID = '81aa63f9-275b-44b0-9b0c-55ef4d6e0b6a';

const badgeUrl = () =>
  `https://api.netlify.com/api/v1/badges/${SITE_ID}/deploy-status?cachebust=${Date.now()}`;

type PublishState = 'idle' | 'starting' | 'started' | 'error';

function DeployTool() {
  const [state, setState] = useState<PublishState>('idle');
  const [badge, setBadge] = useState(badgeUrl);

  // The badge image is Netlify's own status light (grey building, green
  // published, red failed); refresh it while the tool is open.
  useEffect(() => {
    const timer = window.setInterval(() => setBadge(badgeUrl()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const publish = useCallback(() => {
    setState('starting');
    fetch(BUILD_HOOK, { method: 'POST' })
      .then((res) => setState(res.ok ? 'started' : 'error'))
      .catch(() => setState('error'));
  }, []);

  return (
    <Flex justify="center" padding={4}>
      <Card padding={5} radius={3} shadow={1} style={{ maxWidth: 480, marginTop: 40 }}>
        <Stack gap={4}>
          <Text size={2} weight="bold">
            Update the website
          </Text>
          <Text size={1} muted>
            The public site rebuilds itself from your published content. Finish and Publish your
            edits first, then press the button once. One press covers everything you published, no
            need to press it per change.
          </Text>
          <Button
            icon={PublishIcon}
            text={state === 'starting' ? 'Starting...' : 'Publish your changes to the website'}
            tone="primary"
            disabled={state === 'starting'}
            onClick={publish}
          />
          {state === 'started' && (
            <Text size={1}>
              Build started. The site updates when the light below turns green, usually a minute or
              two.
            </Text>
          )}
          {state === 'error' && (
            <Text size={1}>
              That did not go through. Check your internet connection and try once more.
            </Text>
          )}
          <Flex align="center" gap={3}>
            <img src={badge} alt="Website build status" height={20} />
            <Text size={1} muted>
              current status
            </Text>
          </Flex>
          <Text size={1} muted>
            If the light stays red, or your change still does not appear a few minutes after it
            turns green, contact Taylor.
          </Text>
        </Stack>
      </Card>
    </Flex>
  );
}

export const deployTool: Tool = {
  name: 'deploy',
  title: 'Update website',
  icon: PublishIcon,
  component: DeployTool,
};
