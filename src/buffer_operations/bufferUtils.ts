import * as vscode from 'vscode';
import { Logger } from '../util/logger';

export async function getReferencesUnderCursor() {
  const uri = vscode.window.activeTextEditor?.document.uri;
  const position = vscode.window.activeTextEditor?.selection.active;

  if (!uri || !position) {
    return [];
  }

  const references = await vscode.commands.executeCommand<vscode.Location[]>(
    'vscode.executeReferenceProvider',
    uri,
    position,
  );

  return references;
}
