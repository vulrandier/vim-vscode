import { BufferTransformationImpl } from '../bufferTransformer';
import { BufferServiceRegistry } from './bufferServiceRegistry';

let alreadyExecuted = false;

export function initializeBufferServices() {
  if (alreadyExecuted) return;

  BufferServiceRegistry.register('BufferTransformer', new BufferTransformationImpl());

  alreadyExecuted = true;
}
