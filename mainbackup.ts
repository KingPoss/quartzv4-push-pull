import { App, Modal, Notice, Plugin } from 'obsidian';
import { exec } from 'child_process';

export default class VaultUpdatePlugin extends Plugin {
	async onload() {
		// Ribbon icon for quartz sync (using upload icon)
		const syncIcon = this.addRibbonIcon('upload', 'Push Vault to GitHub & build site', (evt: MouseEvent) => {
			new SyncModal(this.app, this).open();
		});
		syncIcon.addClass('vault-sync-ribbon-icon');

		// Ribbon icon for updating vault from GitHub (download icon)
		const downloadIcon = this.addRibbonIcon('download', 'Pull Vault from GitHub (keep local changes)', (evt: MouseEvent) => {
			new DownloadModal(this.app, this).open();
		});
		downloadIcon.addClass('vault-download-ribbon-icon');
	}

	runSync() {
		// Force the active element (if any) to lose focus.
		if (document.activeElement instanceof HTMLElement) {
		console.log("[runDownload] Blurring active element:", document.activeElement);
		document.activeElement.blur();
	}
		const vaultPath = (this.app.vault.adapter as any).getBasePath?.() || this.app.vault.getResourcePath("");
		console.log("[runSync] Vault path:", vaultPath);
		exec('npx quartz sync', { cwd: vaultPath }, (error, stdout, stderr) => {
			if (error) {
				console.error('[runSync] Error syncing vault:', error);
				new Notice(`Sync failed: ${error.message}`);
				return;
			}
			console.log('[runSync] Sync output:', stdout);
			new Notice("Vault pushed to GitHub! Site is being built by Quartz");
			// Delay refresh to allow file system changes to settle
			setTimeout(() => {
				console.log("[runSync] Triggering file explorer refresh...");
				this.refreshFileExplorer();
				this.app.workspace.trigger('layout-change');
			}, 1500);
		});
	}
	
	runDownload() {
		// Force the active element (if any) to lose focus.
		if (document.activeElement instanceof HTMLElement) {
		console.log("[runDownload] Blurring active element:", document.activeElement);
		document.activeElement.blur();
	}
		const vaultPath = (this.app.vault.adapter as any).getBasePath?.() || this.app.vault.getResourcePath("");
		console.log("[runDownload] Vault path:", vaultPath);
		exec('git pull origin v4 -X theirs', { cwd: vaultPath }, (error, stdout, stderr) => {
			if (error) {
				console.error('[runDownload] Error updating vault:', error);
				new Notice(`Update failed: ${error.message}`);
				return;
			}
			console.log('[runDownload] Update output:', stdout);
			new Notice("Vault pulled from GitHub, local version is up to date.");
			// Delay refresh to allow file system changes to settle
			setTimeout(() => {
				console.log("[runDownload] Triggering file explorer refresh...");
				this.refreshFileExplorer();
				this.app.workspace.trigger('layout-change');
			}, 1500);
		});
	}

	async refreshFileExplorer() {
		console.log("[refreshFileExplorer] Attempting to use file-explorer-reload plugin...");
		const fer = this.app.plugins.plugins['file-explorer-reload'];
		if (fer && typeof fer.reloadDirectory === "function") {
			try {
				// Pass "" to indicate the vault root.
				await fer.reloadDirectory("", true);
				console.log("[refreshFileExplorer] File explorer reloaded via file-explorer-reload plugin.");
				return;
			} catch (error) {
				console.error("[refreshFileExplorer] Error reloading via file-explorer-reload plugin:", error);
			}
		}
		// Fallback: manual refresh.
		console.log("[refreshFileExplorer] Falling back to manual refresh.");
		const allFiles = this.app.vault.getFiles();
		console.log("[refreshFileExplorer] Total files in vault:", allFiles.length);
		
		const leaves = this.app.workspace.getLeavesOfType('file-explorer');
		console.log("[refreshFileExplorer] Found", leaves.length, "file explorer leaves.");
		leaves.forEach((leaf, idx) => {
			if (leaf.view && typeof (leaf.view as any).refresh === 'function') {
				console.log(`[refreshFileExplorer] Refreshing leaf #${idx}...`);
				try {
					(leaf.view as any).refresh();
					console.log(`[refreshFileExplorer] Leaf #${idx} refreshed successfully.`);
				} catch (err) {
					console.error(`[refreshFileExplorer] Error refreshing leaf #${idx}:`, err);
				}
			} else {
				console.log(`[refreshFileExplorer] Leaf #${idx} does not have a refresh method.`);
			}
		});
	}
	

class SyncModal extends Modal {
	plugin: VaultUpdatePlugin;
	constructor(app: App, plugin: VaultUpdatePlugin) {
		super(app);
		this.plugin = plugin;
	}
	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Push vault to Github & build site?' });
		contentEl.createEl('p', { text: 'This will push any local changes to the "v4" branch on Github' });

		const buttonContainer = contentEl.createDiv({ cls: 'button-container' });
		const syncBtn = buttonContainer.createEl('button', { text: 'Sync' });
		syncBtn.onclick = () => {
			this.close();
			this.plugin.runSync();
		};
		const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
		cancelBtn.onclick = () => this.close();
	}
	onClose() {
		this.contentEl.empty();
	}
}

class DownloadModal extends Modal {
	plugin: VaultUpdatePlugin;
	constructor(app: App, plugin: VaultUpdatePlugin) {
		super(app);
		this.plugin = plugin;
	}
	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Pull vault from GitHub?' });
		contentEl.createEl('p', { text: 'This will pull the latest changes from the "v4" branch.' });
		const buttonContainer = contentEl.createDiv({ cls: 'button-container' });
		const updateBtn = buttonContainer.createEl('button', { text: 'Update Vault' });
		updateBtn.onclick = () => {
			this.close();
			this.plugin.runDownload();
		};
		const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
		cancelBtn.onclick = () => this.close();
	}
	onClose() {
		this.contentEl.empty();
	}
}
