import * as vscode from 'vscode';

/**
 * Represents a buffer transformation operation
 */
interface IBufferTransformation {
  continueOnError: boolean;
  targetBuffers: vscode.Uri[];
}

export interface BufferMacroTransformation extends IBufferTransformation {
  type: 'macro'; // All Transformations should have a type
  register: string;
}

export type BufferTransformationRequest = BufferMacroTransformation; // Add other operations with "... | OtherOperation"

export interface IBufferTransformer {
  execute(transformation: BufferTransformationRequest): Promise<void>;
}
