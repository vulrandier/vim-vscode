import * as vscode from 'vscode';
import { ModeHandlerMap } from '../mode/modeHandlerMap';
import { executeTransformations } from '../transformations/execute';
import { Logger } from '../util/logger';
import { StatusBar } from '../statusBar';
import { IBufferTransformer } from './types';

/**
 * Represents a buffer transformation operation
 */
interface IBufferTransformation {
  continueOnError: boolean;
  targetBuffers: vscode.Uri[];
}

interface BufferMacroTransformation extends IBufferTransformation {
  type: 'macro'; // All Transformations should have a type
  register: string;
}

export type BufferTransformationRequest = BufferMacroTransformation; // Add other operations with "... | OtherOperation"

/**
 * Implementation of buffer transformation operations
 * Handles the actual execution of operations across multiple buffers
 */
export class BufferTransformationImpl implements IBufferTransformer {
  async execute(transformation: BufferTransformationRequest): Promise<void> {
    switch (transformation.type) {
      case 'macro':
        await this.executeMacroTransformation(transformation);
        break;
      default:
        Logger.warn(`Unknown transformation type: ${transformation.type}`);
    }
  }

  private async executeMacroTransformation(
    transformation: BufferTransformationRequest,
  ): Promise<void> {
    const { register, continueOnError, targetBuffers } = transformation;

    let processedCount = 0;
    let errorCount = 0;

    Logger.info(
      `BufferTransformationExecutor: Executing macro @${register} across ${targetBuffers.length} buffers, continueOnError: ${continueOnError}`,
    );

    for (const bufferUri of targetBuffers) {
      try {
        await vscode.window.showTextDocument(bufferUri);

        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || activeEditor.document.uri.toString() !== bufferUri.toString()) {
          Logger.warn(`Failed to switch to buffer: ${bufferUri.toString()}`);
          continue;
        }

        const [modeHandler] = await ModeHandlerMap.getOrCreate(activeEditor);
        modeHandler.vimState.editor = activeEditor;
        modeHandler.syncCursors();

        await executeTransformations(modeHandler, [
          {
            type: 'macro',
            register,
            replay: 'contentChange',
          },
        ]);

        processedCount++;
        Logger.debug(`Successfully executed macro on buffer: ${bufferUri.toString()}`);
      } catch (error) {
        errorCount++;
        Logger.warn(`Error executing macro on buffer ${bufferUri.toString()}: ${error}`);

        if (!continueOnError) {
          Logger.info(`Stopping execution due to error (continueOnError=false)`);
          break;
        }
      }
    }

    Logger.info(
      `Macro execution completed: ${processedCount} buffers processed, ${errorCount} errors${errorCount > 0 && continueOnError ? ' (continued on error)' : ''}`,
    );
  }
}
