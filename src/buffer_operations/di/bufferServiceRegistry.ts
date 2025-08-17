type ServiceName = 'BufferTransformer';

/**
 * Simple DI container to solve circular dependency with Modehandler
 */
export class BufferServiceRegistry {
  private static services: Map<ServiceName, any> = new Map();

  static register<T>(name: ServiceName, instance: T) {
    if (BufferServiceRegistry.get(name)) {
      throw new Error(`Service $(name) is already registered!`);
    }
    BufferServiceRegistry.services.set(name, instance);
  }

  static get<T>(name: ServiceName): T | undefined {
    return this.services.get(name) as T;
  }
}
