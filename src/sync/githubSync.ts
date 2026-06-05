import type { AppState } from '../store/appStore';

const GIST_FILENAME = 'ai-hub-v3-state.json';

class GitHubSync {
  private gistId: string | null = null;
  private token: string | null = null;

  constructor() {
    this.gistId = localStorage.getItem('ai-hub-gist-id');
    this.token = localStorage.getItem('ai-hub-github-token');
  }

  setCredentials(token: string, gistId?: string): void {
    this.token = token;
    if (gistId) this.gistId = gistId;
    localStorage.setItem('ai-hub-github-token', token);
    if (gistId) localStorage.setItem('ai-hub-gist-id', gistId);
  }

  async push(state: AppState): Promise<void> {
    if (!this.token) throw new Error('GitHub token not set');

    const content = JSON.stringify(state, null, 2);

    if (this.gistId) {
      const res = await fetch(`https://api.github.com/gists/${this.gistId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: { [GIST_FILENAME]: { content } },
        }),
      });
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    } else {
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: `token ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'AI Hub v3 State Backup',
          public: false,
          files: { [GIST_FILENAME]: { content } },
        }),
      });
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = await res.json();
      this.gistId = data.id;
      localStorage.setItem('ai-hub-gist-id', data.id);
    }
  }

  async pull(): Promise<AppState | null> {
    if (!this.token || !this.gistId) return null;
    const res = await fetch(`https://api.github.com/gists/${this.gistId}`, {
      headers: { Authorization: `token ${this.token}` },
    });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const data = await res.json();
    const file = data.files[GIST_FILENAME];
    if (!file) return null;
    const content = file.content || await fetch(file.raw_url).then(r => r.text());
    return JSON.parse(content) as AppState;
  }

  isConfigured(): boolean {
    return !!this.token;
  }

  getGistId(): string | null {
    return this.gistId;
  }
}

export const githubSync = new GitHubSync();
