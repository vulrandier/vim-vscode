import * as vscode from 'vscode';
import { Logger } from '../util/logger';
import { BufferServiceRegistry } from './di/bufferServiceRegistry';
import { BufferMacroTransformation, IBufferTransformer } from './types';
import { VimState } from '../state/vimState';

export class BufferOperationManager {
  private readonly bufferTransformer: IBufferTransformer;
  private vimState: VimState;
  constructor(vimSate: VimState) {
    this.vimState = vimSate;
    this.bufferTransformer = BufferServiceRegistry.get('BufferTransformer')!;
  }

  async executeBufdo(register: string, continueOnError: boolean): Promise<void> {
    // Gather all target buffers for argdo (all open tabs)
    const allTabs = vscode.window.tabGroups.all.flatMap((group) => group.tabs);
    const targetBuffers = allTabs
      .filter((tab) => tab.input instanceof vscode.TabInputText)
      .map((tab) => (tab.input as vscode.TabInputText).uri);

    if (targetBuffers.length === 0) {
      Logger.info('No target buffers found for bufdo');
      return;
    }

    Logger.info(`executeBufdo: Found ${targetBuffers.length} target buffers`);

    // Create transformation request and execute it
    const transformationRequest: BufferMacroTransformation = {
      type: 'macro',
      register,
      continueOnError,
      targetBuffers,
    };

    await this.bufferTransformer.execute(transformationRequest);
  }
}
