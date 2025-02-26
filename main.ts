import { App, Modal, Notice, Plugin } from 'obsidian';
import { exec } from 'child_process';

export default class QuartzGitSyncPlugin extends Plugin {
  async onload() {
    // Ribbon icon to push
    this.addRibbonIcon('upload', 'Push Vault (Quartz)', () => {
      new ConfirmationModal(this.app, 'Push vault to GitHub & build site?', () => this.runSync()).open();
    });

    // Ribbon icon to pull
    this.addRibbonIcon('download', 'Pull Vault from GitHub', () => {
      new ConfirmationModal(this.app, 'Pull vault from GitHub?', () => this.runDownload()).open();
    });
  }

  private runSync() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const vaultPath = (this.app.vault.adapter as any).getBasePath?.() || (this.app.vault.adapter as any).basePath;

    exec('npx quartz sync', { cwd: vaultPath }, (error, stdout, stderr) => {
      if (error) {
        new Notice(`Sync failed: ${error.message}`);
        console.error('[runSync] error:', stderr);
        return;
      }
      new Notice('Vault pushed to GitHub! Building with Quartz...');
      // Wait a couple seconds, then refresh
      setTimeout(() => this.refreshFileExplorer(), 3000);
    });
  }

  private runDownload() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const vaultPath = (this.app.vault.adapter as any).getBasePath?.() || (this.app.vault.adapter as any).basePath;

    exec('git pull origin v4 -X theirs', { cwd: vaultPath }, (error, stdout, stderr) => {
      if (error) {
        new Notice(`Pull failed: ${error.message}`);
        console.error('[runDownload] error:', stderr);
        return;
      }
      new Notice('Vault pulled from GitHub, up to date.');
      // Wait a couple seconds, then refresh
      setTimeout(() => this.refreshFileExplorer(), 3000);
    });
  }

  private async refreshFileExplorer() {
    // // Try "file-explorer-reload" plugin if available
    // const fer = this.app.plugins.plugins['file-explorer-reload'];
    // if (fer && typeof fer.reloadDirectory === 'function') {
    //   try {
    //     await fer.reloadDirectory('/', true);
    //     return;
    //   } catch (err) {
    //     console.error('[refreshFileExplorer] file-explorer-reload plugin error:', err);
    //   }
    // }
    // Otherwise, do manual refresh
    this.app.workspace.getLeavesOfType('file-explorer').forEach(leaf => {
      const anyView = leaf.view as any;
      if (anyView?.refresh) {
        anyView.refresh();
      }
    });
  }
}

class ConfirmationModal extends Modal {
  callback: () => void;
  titleText: string;

  constructor(app: App, title: string, callback: () => void) {
    super(app);
    this.titleText = title;
    this.callback = callback;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: this.titleText });

    const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
    buttonContainer.createEl('button', { text: 'Confirm' }, (btn) => {
      btn.onclick = () => {
        this.close();
        this.callback();
      };
    });
    buttonContainer.createEl('button', { text: 'Cancel' }, (btn) => {
      btn.onclick = () => this.close();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
