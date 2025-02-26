"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var obsidian_1 = require("obsidian");
var child_process_1 = require("child_process");
var QuartzGitSyncPlugin = /** @class */ (function (_super) {
    __extends(QuartzGitSyncPlugin, _super);
    function QuartzGitSyncPlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QuartzGitSyncPlugin.prototype.onload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Ribbon icon to push
                this.addRibbonIcon('upload', 'Push Vault (Quartz)', function () {
                    new ConfirmationModal(_this.app, 'Push vault to GitHub & build site?', function () { return _this.runSync(); }).open();
                });
                // Ribbon icon to pull
                this.addRibbonIcon('download', 'Pull Vault from GitHub', function () {
                    new ConfirmationModal(_this.app, 'Pull vault from GitHub?', function () { return _this.runDownload(); }).open();
                });
                return [2 /*return*/];
            });
        });
    };
    QuartzGitSyncPlugin.prototype.runSync = function () {
        var _this = this;
        var _a, _b;
        if (document.activeElement instanceof HTMLElement)
            document.activeElement.blur();
        var vaultPath = ((_b = (_a = this.app.vault.adapter).getBasePath) === null || _b === void 0 ? void 0 : _b.call(_a)) || this.app.vault.adapter.basePath;
        (0, child_process_1.exec)('npx quartz sync', { cwd: vaultPath }, function (error, stdout, stderr) {
            if (error) {
                new obsidian_1.Notice("Sync failed: ".concat(error.message));
                console.error('[runSync] error:', stderr);
                return;
            }
            new obsidian_1.Notice('Vault pushed to GitHub! Building with Quartz...');
            // Wait a couple seconds, then refresh
            setTimeout(function () { return _this.refreshFileExplorer(); }, 3000);
        });
    };
    QuartzGitSyncPlugin.prototype.runDownload = function () {
        var _this = this;
        var _a, _b;
        if (document.activeElement instanceof HTMLElement)
            document.activeElement.blur();
        var vaultPath = ((_b = (_a = this.app.vault.adapter).getBasePath) === null || _b === void 0 ? void 0 : _b.call(_a)) || this.app.vault.adapter.basePath;
        (0, child_process_1.exec)('git pull origin v4 -X theirs', { cwd: vaultPath }, function (error, stdout, stderr) {
            if (error) {
                new obsidian_1.Notice("Pull failed: ".concat(error.message));
                console.error('[runDownload] error:', stderr);
                return;
            }
            new obsidian_1.Notice('Vault pulled from GitHub, up to date.');
            // Wait a couple seconds, then refresh
            setTimeout(function () { return _this.refreshFileExplorer(); }, 3000);
        });
    };
    QuartzGitSyncPlugin.prototype.refreshFileExplorer = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
                this.app.workspace.getLeavesOfType('file-explorer').forEach(function (leaf) {
                    var anyView = leaf.view;
                    if (anyView === null || anyView === void 0 ? void 0 : anyView.refresh) {
                        anyView.refresh();
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    return QuartzGitSyncPlugin;
}(obsidian_1.Plugin));
exports.default = QuartzGitSyncPlugin;
var ConfirmationModal = /** @class */ (function (_super) {
    __extends(ConfirmationModal, _super);
    function ConfirmationModal(app, title, callback) {
        var _this = _super.call(this, app) || this;
        _this.titleText = title;
        _this.callback = callback;
        return _this;
    }
    ConfirmationModal.prototype.onOpen = function () {
        var _this = this;
        var contentEl = this.contentEl;
        contentEl.createEl('h2', { text: this.titleText });
        var buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
        buttonContainer.createEl('button', { text: 'Confirm' }, function (btn) {
            btn.onclick = function () {
                _this.close();
                _this.callback();
            };
        });
        buttonContainer.createEl('button', { text: 'Cancel' }, function (btn) {
            btn.onclick = function () { return _this.close(); };
        });
    };
    ConfirmationModal.prototype.onClose = function () {
        this.contentEl.empty();
    };
    return ConfirmationModal;
}(obsidian_1.Modal));
